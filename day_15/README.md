create the Repo in git 

                                                           GIT BASICS

--Git is a Version Control System (VCS).

--Git--> Software installed on your computer
--GitHub --> Website where Git repositories are stored online.

--> git config 
git config --global user.name "Kanvi Doshi"
git config --global user.email "kanvi@email.com"
git config --list

--> create Repo
cd project-name
git init

-->Git Workflow 
-->                  git add .                     git commit
working directory --------------> Staging area -------------> Repository

--> git status

adding a single file
-->git add fileName.ts/js

adding everything
--> git add . 

commit
--> git commit -m "Added student CRUD"

View Commit History
--> git log
--> git log --oneline

Branches

--> git branch

--> [create]
-->git branch login 

--> [switch]
--> git checkout login    OR    git switch login

-->[Create and switch]
-->git checkout -b login  OR git switch -c login

Merge
-->[Create]
--> login
git switch main
-->git merge login  [login will be merged in main branch now]


Undo Commands

-->[done only git add .]use this restore --staged

Remove from staging
-->git restore --staged 

Discard local changes
--> git restore student.ts

Remove untracked files
--> git clean -fd

Undo last commit (keep changes)
-->git reset --soft HEAD~1

Undo last commit (unstage changes)
--> git reset HEAD~1

Delete last commit and changes
--> git reset --hard HEAD~1

####### Connect to GitHub
--> git remote add origin https://github.com/username/project.git

push
-->git push -u origin main

after the first push
-->git push

pull
-->git pull

clone
-->git clone https://github.com/username/project.git