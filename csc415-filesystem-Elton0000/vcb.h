#pragma once
typedef struct VCB{
    long cntblocks;
    long sig; // signature to check if already formatted
    int sizeofblocks;
    int fspos; //starting position of free space manager
    int rdpos; // position of root directory
}VCB;
VCB* myVCB;
#define Signature 0x43DBA39071C3672