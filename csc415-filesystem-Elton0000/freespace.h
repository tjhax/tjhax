#pragma once

typedef struct freeSpace {
    //In blocks only
    int allocatorIndex; //00000 read from left to right, 0 = free, 1 = full
    int addressIndex; // allows me to chain the logical address spaces together
    int bufferIndex;
    char buffers[];
} FreeSpace;
FreeSpace* myFreespaceMap;

int allocate_Blocks(int count);
int reallocate_Blocks(FreeSpace *fs, int original, int create);
int release_Blocks();

