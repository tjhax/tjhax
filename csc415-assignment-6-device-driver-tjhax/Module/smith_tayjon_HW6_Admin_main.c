#include <linux/module.h> // all for kernel functions
#include <linux/kernel.h>
#include <linux/fs.h>
#include <linux/uaccess.h>
#include <linux/miscdevice.h>
#include <linux/mutex.h>
#include "stringchangeboth.h"

#define DEVICE_NAME "smith_tayjon_HW6_main" //will show up under our /dev/ folder
#define BUF_SIZE 512

MODULE_LICENSE("GPL"); //required licesne for kernels

static char buffer[BUF_SIZE];
static size_t lenData;
static int transform = STRING_UPPER;

static DEFINE_MUTEX(str_mutex);

static void toUpperCase(char *buf, size_t len)
{
    size_t i;
    for (i = 0; i < len; i++)
    {
        if(buf[i] >= 'a' && buf[i] <= 'z')
        {
            buf[i] = buf[i] - 'a' + 'A';
        }
    }
}

static void toLowerCase(char *buf, size_t len)
{
    size_t i;
    for (i = 0; i < len; i++)
    {
        if(buf[i] >= 'A' && buf[i] <= 'Z')
        {
            buf[i] = buf[i] - 'A' + 'a';
        }
    }
}

static void toReverseString(char *buf, size_t len)
{
    
    size_t i = 0;
    size_t j = len ? len - 1 : 0;
    char tmp;

    while (i < j)
    {
        tmp = buf[i];
        buf[i] = buf[j];
        buf[j] = tmp;
        i++;
        j--;
    }
}

static void toApplyString(char *buf, size_t len)
{
    switch(transform)
    {
        case STRING_UPPER:
            toUpperCase(buf, len);
            break;
        case STRING_LOWER:
            toLowerCase(buf, len);
            break;
        case STRING_REVERSE:
            toReverseString(buf,len);
            break;
        default:
            printk(KERN_WARNING "transform: unknown case %d\n", transform);
            break;
    }
}

static int stringOpen(struct inode *inode, struct file *file)
{
    printk(KERN_INFO "string transform: open\n");
    return 0;
}

static int stringRelease(struct inode *inode, struct file *file)
{
   printk(KERN_INFO "string transform: release\n");
    return 0; 
}

static ssize_t stringRead(struct file *file, char __user *user_buf, size_t count, loff_t *ppos)
{
    ssize_t to_copy;

    if(mutex_lock_interruptible(&str_mutex)) //locking mutex to only one read / write at a time
    {
        return -ERESTARTSYS;
    }

    if(*ppos >= lenData) //return if EOF
    {
        mutex_unlock(&str_mutex);
        return 0;
    }

    to_copy = min(count, lenData - (size_t)*ppos);

    if(copy_to_user(user_buf, buffer + *ppos, to_copy))
    {
        mutex_unlock(&str_mutex);
        return -EFAULT;
    }

    *ppos += to_copy;

    printk(KERN_INFO "string transform: read %zd bytes\n", to_copy);

    mutex_unlock(&str_mutex);
    return to_copy;
}

static ssize_t stringWrite(struct file *file, const char __user *user_buf, size_t count, loff_t *ppos)
{
    ssize_t to_copy;

    if(mutex_lock_interruptible(&str_mutex)) //locking before we touch shared data
    {
        return -ERESTARTSYS;
    }

    to_copy = min(count, (size_t)BUF_SIZE);

    if(copy_from_user(buffer, user_buf, to_copy))
    {
        mutex_unlock(&str_mutex);
        return -EFAULT;
    }

    lenData = to_copy;

    toApplyString(buffer, lenData);
    printk(KERN_INFO "string transform: transformed %zu bytes in mode %d\n", lenData, transform);

    *ppos = 0; //resetting our position for our next read

    mutex_unlock(&str_mutex);
    return to_copy;

}

static long stringIoctl(struct file *file, unsigned int cmd, unsigned long arg)
{
    int mode;

    if(mutex_lock_interruptible(&str_mutex))
    {
        return -ERESTARTSYS;
    }

    switch(cmd)
    {
    case STRING_MODE:
        if(copy_from_user(&mode, (int __user *)arg, sizeof(int)))
        {
            mutex_unlock(&str_mutex);
            return -EFAULT;
        }

        if (mode != STRING_UPPER && 
            mode != STRING_LOWER &&
            mode != STRING_REVERSE)
        {
            mutex_unlock(&str_mutex);
            return -EINVAL;
        }

        transform = mode;
        printk(KERN_INFO "transform: mode set to %s\n",
            (transform == STRING_UPPER) ? "UPPER" :
            (transform == STRING_LOWER) ? "LOWER" : "REVERSE");
        break;

    default:
        mutex_unlock(&str_mutex);
        return -ENOTTY;
    }

    mutex_unlock(&str_mutex);
    return 0;
}

static const struct file_operations stringFops = //our file operations struct
{
    .owner = THIS_MODULE,
    .open = stringOpen,
    .release = stringRelease,
    .read = stringRead,
    .write = stringWrite,
    .unlocked_ioctl = stringIoctl,
};

static struct miscdevice stringMisc = //creates /dev/ entry for us
{
    .minor = MISC_DYNAMIC_MINOR,
    .name = DEVICE_NAME,
    .fops = &stringFops,
};

static int __init stringInit(void)
{
    int ret = misc_register(&stringMisc);
    if (ret)
    {
        printk(KERN_ERR "transform: misc_register failed (%d)\n", ret);
        return ret;
    }

    printk(KERN_INFO "transform: module loaded, device /dev/%s\n", DEVICE_NAME);
    return 0;
}
//module clean up at the end
static void __exit stringExit(void)
{
    misc_deregister(&stringMisc);
    printk(KERN_INFO "transform: module unloaded\n");
}

module_init(stringInit);
module_exit(stringExit);