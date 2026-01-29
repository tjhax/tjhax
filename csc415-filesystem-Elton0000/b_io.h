/**************************************************************
* Class::  CSC-415-03 Fall 2025
* Name:: Elton Nahn, Jeremy Chuang, Christopher Huynh, Tayjon Smith
* Student IDs:: 923660358, 922017366, 922734589, 921355939
* GitHub-Name::elton0000, Jeramieaka, Shupadup, tjhax
* Group-Name::Team Jamaica
* Project:: Basic File System
*
* File:: b_io.h
*
* Description:: Interface of basic I/O Operations
*
**************************************************************/

#ifndef _B_IO_H
#define _B_IO_H
#include <fcntl.h>

typedef int b_io_fd;

b_io_fd b_open (char * filename, int flags);
int b_read (b_io_fd fd, char * buffer, int count);
int b_write (b_io_fd fd, char * buffer, int count);
int b_seek (b_io_fd fd, off_t offset, int whence);
int b_close (b_io_fd fd);

#endif

