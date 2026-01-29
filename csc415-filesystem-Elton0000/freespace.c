/**************************************************************
* Class::  CSC-415-03 Fall 2025
* Name:: Elton Nhan, Jeremy Chuang, Christopher Huynh, Tayjon Smith
* Student IDs:: 923660358, 922017366, 922734589, 921355939
* GitHub-Name::elton0000, Jeramieaka, Shupadup, tjhax
* Group-Name::Team Jicama
* Project:: Basic File System
*
* File:: freespace.c
*
* Description:: 
*	This is the freespace part of our project, 
*	making sure we allocate, release, and reallocate blocks.
*	
*
**************************************************************/
#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include <sys/types.h>
#include <sys/stat.h>
#include "freespace.h"

int allocate_Blocks(int count) {//Milestone 1
    if (count <= 0) {
        return -1; //bad input handling
    }
    int startpos = 0;
    int startPosInit = 0;
    int currentChain;
    int found = 0;

    while (count > 0) {
        //Should only be iterating through bitmap, not expecting values besides 0 and 1
        for (int i = 0; found == 0 && i < myFreespaceMap->allocatorIndex; i++) {
            if (startPosInit == 0 && myFreespaceMap->buffers[i] == 0) {
                found = 1;
                startpos = i;
                startPosInit = 1;
                currentChain = startpos + myFreespaceMap->allocatorIndex;
                myFreespaceMap->buffers[i] = 1;
                myFreespaceMap->buffers[currentChain] = -1;
                count--;
            }
            else if (myFreespaceMap->buffers[i] == 0) {
                found = 1;
                myFreespaceMap->buffers[i] = 1;
                myFreespaceMap->buffers[currentChain] = i + myFreespaceMap->allocatorIndex;
                currentChain = i + myFreespaceMap->allocatorIndex;
                myFreespaceMap->buffers[currentChain] = -1;
                count--;
            }     
        }
        found = 0;
    }
    //startpos would be an allocator index value to the next open block. 
    //accessing an index that returns -1 indicates end of block chain.
    //appears as FF on allocator portion of freespace
    return startpos;
}

int reallocate_Blocks(FreeSpace *fs, int original, int create){
    return 0;
}


int release_Blocks() {
    free(myFreespaceMap);
    myFreespaceMap = NULL;
    return 0;
}