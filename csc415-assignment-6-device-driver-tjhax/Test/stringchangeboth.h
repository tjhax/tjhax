#ifndef STRINGCHANGEBOTH_H
#define STRINGCHANGEBOTH_H

#include <linux/ioctl.h>


#define STRING_MAGIC 't'

#define STRING_UPPER 1
#define STRING_LOWER 2
#define STRING_REVERSE 3

#define STRING_MODE _IOW(STRING_MAGIC, 1 , int)

#endif