#include <stdio.h>
#include <string.h>
#define _POSIX_C_SOURCE 200809L

#include "rootdirectory.c"
typedef struct parsePathFile
{
directoryEntry * parent;
char * lastElementName;
int index;
} ppinfo;

ppinfo* currentPath;

int parsePathFile (char * path, ppinfo *ppi)
{
directoryEntry* startParent;
directoryEntry* parent;
char * savePtr;
char * token1;
char * token2;

if(path == NULL) return -1;

if(path[0] == "/") {
    startParent = alreadyLoadedRootDir; //make sure to create this variable
}
	
else {
    startParent = alreadyLoadedCWD; //make sure to create this variable
}
parent = startParent;

token1 = strtok_r(path,"/", &savePtr);
if(token1 == NULL)
    { //indent this part starting here then down
        if(startParent == alreadyLoadedRootDir)
            {
                ppi -> parent = parent;
                ppi -> lastElementName = NULL;
                ppi -> index = -2;
                return 0;
            }
        else
            {
            return -1;
            }
    while(1)
        {
            int idx = findInDirectory(parent, token1);
            token2 = strtok_r(NULL, "/", &savePtr);
            if (token2 == NULL) {
                ppi -> parent = parent;
                ppi -> lastElementName = token1;
                ppi -> index = idx;
                return (0);
            }
            else {
                if (idx == 1)
                    return -2;
                    if (!isDEaDir(&(parent[idx])))
                    return -3;
                    directoryEntry* tempParent = loadDirectory(&(parent[idx]));
                    if (parent != structParent) //make sure to create this variable
                        free(parent);
                    }
        }
    }
}
