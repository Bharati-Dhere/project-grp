#Note :- 
Don't push changes in directly on main branch

#start project first time 
# Clone the Repository (first time only)

git clone https://github.com/your-username/your-repo.git
cd your-repo

#step 1 (if not a first time then start with this steps)
git checkout main           --You switch to the main branch.
git pull origin main        -- for latest code in local laptop folders

#step 2
git checkout -b feature/add-product-form    ---You create a new branch for your specific task or feature (like adding a product form). This keeps your changes separate from the main branch.

#step 3
git add .              -- tells Git to track all the changes you made in files.
git commit -m "Add product form component"      --saves those changes locally with a clear message.

#step 4
git push origin feature/add-product-form    --This uploads your local branch to GitHub so others can see your work.


#last 
ask your team leader to review and merge it into the main branch.




D:\clone\project-grp>node backend/scripts/set_admin_password.js <admin_email> <new_password>
( dbharati5162@gmail.com admin@A123)

D:\clone\project-grp\backend>node scripts/make_admin.js dbharati5162@gmail.com

# backend installation after clone
cd backend

npm install -g nodemon

npm install bcryptjs cookie-parser cors nodemailer express firebase-admin jsonwebtoken mongoose node-fetch

nodemon run start

# frontend installation after clone

npm install

npm start