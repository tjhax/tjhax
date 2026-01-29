#ifndef _ROOTDIRECTORY_H
#define _ROOTDIRECTORY_H

#include "vcb.h"

    typedef struct directoryEntry{
        // record the name of file
        char fileName[64];
        // store the bytes occupied
        int filesize;
        // record the starting LBA 
        int location;

        time_t lastRead;
        time_t lastWrite;
        time_t createDated;
        struct directoryEntry **entries;
        

    }directoryEntry;

int initializeRootDirectory(VCB* VCBPtr,directoryEntry* parent);

#endif