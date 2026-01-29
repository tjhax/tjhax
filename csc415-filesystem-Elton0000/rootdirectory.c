/**************************************************************
* Class::  CSC-415-03 Fall 2025
* Name:: Elton Nhan, Jeremy Chuang, Christopher Huynh, Tayjon Smith
* Student IDs:: 923660358, 922017366, 922734589, 921355939
* GitHub-Name::elton0000, Jeramieaka, Shupadup, tjhax
* Group-Name::Team Jicama
* Project:: Basic File System
*
* File:: rootdirectory.c
*
* Description:: Initialize the root directory by first computing 
* then allocate enough space, then create '.' and '..' entries
* finally write the directory to the disk 
*	
*
**************************************************************/
#include <stdlib.h>
#include <string.h>
#include "rootdirectory.h"
#include "freespace.h"
#include "fsLow.h"
#include "time.h"

#define DirectorySize 50
 
    // typedef struct directoryEntry{
    //     // record the name of file
    //     char fileName[64];
    //     // store the bytes occupied
    //     int filesize;
    //     // record the starting LBA 
    //     int location;

    //     time_t lastRead;
    //     time_t lastWrite;
    //     time_t createDated;
    //     struct directoryEntry **entries;
        

    // }directoryEntry;

// int initializeRootDirectory(VCB *VCB){
int initializeRootDirectory(VCB *VCB,directoryEntry* parent){    

    // 4a 4b 4c 
    // calculate how many blocks we need for the entries
    int sizeOfBlock = VCB->sizeofblocks;
    int blockNeeded = (DirectorySize * sizeof(directoryEntry)) / sizeOfBlock;
    int remainding = (DirectorySize *sizeof(directoryEntry)) % sizeOfBlock;

    // +1 block if it doens't devided perfectly, make sure they got enough space
    if(remainding != 0){
        blockNeeded +=1;
    }

    //how many entries we can put in the allocated blocks
    int maximunEntriesInBlock = (blockNeeded *sizeOfBlock) /sizeof(directoryEntry);

    // allocate a buffer to hold the directory
    directoryEntry *rootDirectory = malloc(blockNeeded * sizeOfBlock);

    // set the buffer with all 0
    memset(rootDirectory,0,blockNeeded * sizeOfBlock);

    // 4e 
    // set all entries to empty value
    for(int i = 0; i < maximunEntriesInBlock; i++){
        rootDirectory[i].fileName[0] = '\0';
        rootDirectory[i].filesize = 0;
        rootDirectory[i].location = -1;
    }
    // 4f
    // call the function for contiguous length of blockneeded
    int startpos = allocate_Blocks(blockNeeded);
    time_t now = time(NULL);
    // 4g
    // set the '.' entry, it points to directory itself, since directory data lives at startpos
    rootDirectory[0].fileName[0] = '.';
    rootDirectory[0].fileName[1] = '\0';
    rootDirectory[0].filesize = blockNeeded * VCB -> sizeofblocks;
    rootDirectory[0].location = startpos;
    rootDirectory[0].createDated = now;
    rootDirectory[0].lastRead = now;
    rootDirectory[0].lastWrite = now;
    
    // 4h
    // set '..' entry, it also points to itself since its the root, there is no parent for it
    if(parent == NULL){
    rootDirectory[1].fileName[0] = '.';
    rootDirectory[1].fileName[1] = '.';
    rootDirectory[1].fileName[2] = '\0';
    rootDirectory[1].filesize = blockNeeded * VCB -> sizeofblocks;
    rootDirectory[1].location = startpos;   
    rootDirectory[1].createDated = now;
    rootDirectory[1].lastRead = now;
    rootDirectory[1].lastWrite = now;
    }
    else{
    rootDirectory[1].fileName[0] = '.';
    rootDirectory[1].fileName[1] = '.';
    rootDirectory[1].fileName[2] = '\0';
    rootDirectory[1].filesize = parent -> filesize;
    rootDirectory[1].location = parent -> location;
    rootDirectory[1].createDated = parent -> createDated;
    rootDirectory[1].lastRead = parent ->lastRead;
    rootDirectory[1].lastWrite = parent ->lastWrite;
    }

    // 4i
    // write the directory to disk where we assign the contigious length
    // int is0 = LBAwrite(rootDirectory,blockNeeded,startpos);
    // if(is0 == 0){
    //     return -1;
    // }

    // 4j
    // record the start LBA in the VCB
    
    // LBAwrite(VCB,1,0);
    // memcpy(&(myFreespaceMap->buffers[startpos]),rootDirectory,rootDirectory[0].filesize);
    // for (int i = startpos; i != -1;) {

    // }
    // int remainingSize = rootDirectory[0].filesize;
    // int committingBlockNum = startpos;
    // int memoryAdjuster = 0;
    // while (remainingSize > 0 && committingBlockNum != -1) {
    //     printf("tootsie rool pop!!!!");
    //     if (remainingSize - 512 <= 0) {
    //         memcpy(&(myFreespaceMap->buffers[myFreespaceMap->bufferIndex + committingBlockNum]),rootDirectory + memoryAdjuster,remainingSize);
    //         remainingSize -= remainingSize;
    //     }
    //     else {
    //         memcpy(&(myFreespaceMap->buffers[myFreespaceMap->bufferIndex + committingBlockNum]),rootDirectory + memoryAdjuster,512);
    //         committingBlockNum = myFreespaceMap->buffers[myFreespaceMap->allocatorIndex + committingBlockNum];
    //         memoryAdjuster += 512;
    //         remainingSize -= 512;
    //     }
    // }
    // free the space
    // free(rootDirectory);
    return startpos; 
}
