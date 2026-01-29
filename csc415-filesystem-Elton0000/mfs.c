#include "mfs.h"
#include <stdio.h>
#include <string.h>
#include "vcb.h"
#include "rootdirectory.c"
#include "parsePath.c"

#define FT_DIRECTORY 4
#define FT_REGFILE 8

char * fs_getcwd(char *pathname, size_t size) {
    
    return pathname;
}

int fs_setcwd(char *pathname) {

}   

int fs_isFile(char * filename) {
    int isFile = parsePathFile(filename,currentPath);
    
    return isFile;
}	//return 1 if file, 0 otherwise

fdDir * fs_opendir(const char *pathname)
{
    const char *usePath = (*pathname == '\0') ? "." : pathname;
    
    
    char pathCopy[256];
    strncpy(pathCopy, pathname, sizeof(pathCopy));
    pathCopy[sizeof(pathCopy)-1] = '\0';

    ppinfo* info = malloc(sizeof(ppinfo));
    int returnCode = parsePathFile(pathCopy, info);

    directoryEntry *dirTable = NULL;
    int owns_table = 0;
    //opening our root directory
    if(info->lastElementName == NULL && info->index == -2)
    {
        dirTable = info->parent;
        owns_table = 0;
    } 
    else if (info->index >=0) //opening our child directry under parent
    {
        directoryEntry *de = &(info->parent[info->index]);
        dirTable = loadDirectory(de);
        owns_table = 1;
    }
    else
    {
        return NULL;
    }
    fdDir *dirp = (fdDir *) calloc(1, sizeof(fdDir));
    if(!dirp->di)
    {
        if(owns_table && dirTable) free(dirTable);
        free(dirp);
        return NULL;
    }

   
    dirp->d_reclen = sizeof(fdDir);
    dirp->dirEntryPosition = 0;
    dirp->di = (struct fs_diriteminfo *)calloc(1, sizeof(struct fs_diriteminfo));

    dirp->table = (void*)dirTable;
    dirp->owns_table = owns_table;

    free(info);
    
    return dirp;
}
extern int isDeaDir(const directoryEntry *de); 

struct fs_diriteminfo *fs_readdir(fdDir *dirp)
{
    directoryEntry *entries = (directoryEntry *) dirp->table;
    int pos = dirp->dirEntryPosition;
    
    int maxEntries = (dirp->entryCount > 0) ? dirp->entryCount : 50;
    //entries can be changed.

    while (pos < maxEntries)
    {
        directoryEntry *de = &entries[pos];
        pos++;
    
        //we will skip empty or unused entries
    if (de->fileName[0] == '\0') 
    {
        continue;
    }
    //filling out to return the info
    struct fs_diriteminfo *info = dirp->di;
    memset(info,0, sizeof(struct fs_diriteminfo));
    info->d_reclen = sizeof(struct fs_diriteminfo);
    info->fileType = isDeaDir(de)? FT_DIRECTORY : FT_REGFILE; 
    strncpy(info->d_name, de->fileName, sizeof(info->d_name)-1);
    info->d_name[sizeof(info->d_name)-1] = '\0';

    dirp->dirEntryPosition = pos; //updating position

    return info; //return back to buffer
}
    //end of directory
    return NULL;
}

int fs_closedir(fdDir *dirp)
{
        if(dirp == NULL) //invalid pointer
        {
            return -1;
        }

        if(dirp->di)
        {
            free(dirp->di);
        }

        if(dirp->owns_table && dirp->table) 
        {
            free(dirp->table);
        }
    //the fdDir should be free'd
    free(dirp);

    return 0; //success if done correctly.
}
int fs_stat(const char *path, struct fs_stat *buf){
    //find and parse path
    char curPath[256];
    ppinfo* info = malloc(sizeof(ppinfo));
    strcpy(curPath,path);
    parsePathFile(path,info);

    // take info from path and return info into a directory entry
    directoryEntry* statInsert = info->index; 
    buf ->st_size = statInsert ->filesize;
    buf ->st_blksize = myVCB ->sizeofblocks;
    buf ->st_blocks = (statInsert->filesize + myVCB->sizeofblocks -1) / myVCB->sizeofblocks;
    // calculated using formula from class y+x-1/x
    buf ->st_accesstime = statInsert ->lastRead;
    buf ->st_modtime = statInsert ->lastWrite;
    buf ->st_createtime = statInsert ->createDated;
    return 0;
}

int fs_mkdir(const char *pathname, mode_t mode){
    char curPath[256];
    ppinfo* info = malloc(sizeof(ppinfo));
    strcpy(curPath,pathname);
    int result = parsePathFile(pathname,info);
    int blocknum = -1;
    // check if path exists
    if(result < 0){
        free(info);
        return -2;
    } 
    // check for existing file or directory with same name
    if(info->index>=0){
        free(info);
        return -1;
    } 
    // return -1 if true
    //else create directory
    directoryEntry* newdir = initializeRootDirectory(myVCB,info->parent);
    int blocknum = ((newdir ->filesize +myVCB -> sizeofblocks -1 )/ myVCB ->sizeofblocks);
    LBAwrite(newdir,blocknum,newdir->location);
    
    free(info);
    return 0;
}

int fs_isDir(char * pathname){
    return 0;
    // return(!fs_isFile(pathname,mode))
    //return 1 if directy, return 0 otherwise
}

int fs_delete(char *pathname){
    return 0;
}

int fs_rmdir(char *pathname){
    return 0;
}