#include <stdio.h>
#include <stdlib.h>
#include<string.h>
#include<fcntl.h>
#include<unistd.h>
#include<sys/ioctl.h>
#include "stringchangeboth.h"

#define DEV_PATH "/dev/smith_tayjon_HW6_main" //path for our kernel module
#define BUF_SIZE 512

static void testFunction(int fd, int mode, const char *label, const char *msg) //helper function using ioctl
{
    char buf[BUF_SIZE];
    ssize_t ret;
    size_t len = strlen(msg);

    printf("\n=== %s ===\n", label);
    printf("Setting Ioctl...\n");
    if(ioctl(fd, STRING_MODE, &mode) < 0)
    {
        perror("ioctl STRING_MODE");
        exit(1);
    }

    printf("Original: '%s'\n", msg);

    memset(buf, 0, sizeof(buf));
    memcpy(buf, msg, len);

    ret = write(fd, buf, len); //we want to be able to write and store into our device
    if (ret < 0) 
    {
        perror("write");
        exit(1);
    }
    printf("Write %zd bytes\n", ret);

    
    memset(buf, 0, sizeof(buf));
    ret = read(fd, buf, sizeof(buf));
    if (ret < 0)
    {
        perror("read");
        exit(1);
    }


    printf("Transformed (%s): '%.*s'\n", label, (int)ret, buf);
}

int main(void)
{
    int fd;
    const char *message = "racecar RACECAR";

    printf("Opening %s...\n", DEV_PATH); //opening our device to read and change the message.
    fd = open(DEV_PATH, O_RDWR);
    if(fd < 0)
    {
        perror("open");
        return 1;
    }


    testFunction(fd, STRING_UPPER,   "UPPER",  message);
    testFunction(fd, STRING_LOWER,   "LOWER",  message);
    testFunction(fd, STRING_REVERSE, "REVERSE",  message);

    close(fd);
    printf("\nDone.\n");
    return 0;
}

