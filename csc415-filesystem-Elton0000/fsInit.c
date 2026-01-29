/**************************************************************
* Class::  CSC-415-03 Fall 2025
* Name:: Elton Nhan, Jeremy Chuang, Christopher Huynh, Tayjon Smith
* Student IDs:: 923660358, 922017366, 922734589, 921355939
* GitHub-Name::elton0000, Jeramieaka, Shupadup, tjhax
* Group-Name::Team Jicama
* Project:: Basic File System
*
* File:: fsInit.c
*
* Description:: Main driver for file system assignment.
*
* This file is where you will start and initialize your system
*
**************************************************************/


#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <stdio.h>
#include <string.h>

#include "fsLow.h"
#include "mfs.h"
#include "vcb.h"
#include "freespace.h"
#include "freespace.c"
#include "rootdirectory.h"
#include "rootdirectory.c"
//#include "parsePath.c"

int initFileSystem (uint64_t numberOfBlocks, uint64_t blockSize)
	{
	printf ("Initializing File System with %ld blocks with a block size of %ld\n", numberOfBlocks, blockSize);

	/* TODO: Add any code you need to initialize your file system. */
	myVCB = malloc(blockSize);
	LBAread(myVCB,1,0);

	// intializes if signature doesn't match
	if(myVCB->sig == Signature){return 0;}	
	//initializes Variables
	myVCB-> sig = Signature;
	myVCB->sizeofblocks = blockSize;
	myVCB->cntblocks = numberOfBlocks;

	// initialize Freespace
	int freeSpaceSize = 
	(sizeof(char) * numberOfBlocks) + 
	(sizeof(int) * numberOfBlocks) +
	(sizeof(char) * numberOfBlocks * blockSize);
	// |bitmap 0s,1s|blocks pointing to other blocks|buffers (size 512)|
	// |0 -> numberOfBlocks| 
	// |numberOfBlocks -> numberOfBlocks + 4 * numberOfBlocks| 
	// |numberOfBlocks + 4 * numberOfBlocks -> numberOfBlocks -> numberOfBlocks + 4 * numberOfBlocks + numberOfBlocks * blockSize| 
	myFreespaceMap = malloc(freeSpaceSize);
	//beginning positions
	myFreespaceMap->addressIndex = 0;
	myFreespaceMap->allocatorIndex = numberOfBlocks;
	myFreespaceMap->bufferIndex = myFreespaceMap->allocatorIndex + sizeof(int) * numberOfBlocks;
	
	for (int i = 0; 
		i < myFreespaceMap->bufferIndex; i++) {
		myFreespaceMap->buffers[i] = 0;
	}
	myVCB->fspos = 0; //On the bitmap, this would be the first open spot
	// initialize root directory
	//4B 4C 00 00 00 00 00 00  77 7D 01 00 34 0C 34 34
	//4B 4C 00 00 00 00 00 00  77 7D 01 00 00 0C 00 00
	//4B 4C 00 00 00 00 00 00  77 7D 01 00 00 0C 00 00
	//4B 4C 00 00 00 00 00 00  77 7D 01 00 00 05 00 00
	LBAwrite(myVCB,1,0); //writes to storage
	initializeRootDirectory(myVCB,NULL);
	LBAwrite(myFreespaceMap,numberOfBlocks,1);
	//currentPath = malloc(sizeof(parsePathFile));
	return 0;
	}
	
	
void exitFileSystem ()
	{
	printf("System exiting\n");
	release_Blocks();
	free(myVCB);
	myVCB = NULL;
	//free(currentPath);
	//currentPath = NULL;
	}
