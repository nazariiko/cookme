# Table of Contents 
 
- [SmartCooking](#smartcooking) 
  - [General Setup](#general-setup) 
    - Requirements
    - Install
    - Run
  - [Setup Dev from Scratch Manually (Local)](#setup-dev-from-scratch-manually-local) 
    - Frontend and Backend Setup
    - AI Python Module Backend Setup
    - Run Full CookMe App Stack on Docker
  - [Deployment](#deployment) 
    - Deployment Stage
    - Go Production
  - [CI/CD](#cicd) 
  - [Static Directories and Files](#static-directories-and-files) 
  - [Generate Site Map](#generate-site-map)
# <a name="smartcooking" id="smartcooking"></a>SmartCooking
```
├── server
│   ├── controllers
│   │   ├── channelSupport.js
│   │   ├── comments.js
│   │   ├── dashboard.js
│   │   ├── home.js
│   ├── models
│   │   ├── levelPermissions.js
│   │   ├── globalModel.js
│   │   ├── privacyModel.js
│   ├── public
│   │   ├── bower_components
│   │   │   ├── jquery
│   │   │   │   ├── src
│   │   │   │   │   ├── core
│   │   │   │   │   │   ├── init.js
│   │   │   │   │   ├── dimensions.js
│   ├── i18n.js
├── public
│   ├── locales
│   │   ├── de
│   │   │   ├── common.json
│   │   ├── en
│   │   │   ├── common.json
```
- `server/controllers`
: This directory contains the controller files which handle the business logic of the application. Each file corresponds to a specific part of the application (e.g., home.js for home page, dashboard.js for dashboard page).

- `server/models`
: This directory contains the model files which interact with the database. Each file corresponds to a specific part of the application (e.g., 
levelPermissions.js for handling permissions based on user levels).

- `server/public/bower_components/jquery/src`
: This directory contains the jQuery library source files used in the application.

- `public/locales`
: This directory contains the localization files for different languages. Each subdirectory corresponds to a specific language (e.g., 
de for German, en for English), and the `common.json` file in each subdirectory contains the localized strings for that language.

- `erver/i18n.js`
: This file contains the configuration for the internationalization (i18n) library used in the application.

- `server/controllers/channelSupport.js`
: This file contains the logic for handling channel support related operations.

- `server/controllers/comments.js`
: This file contains the logic for handling comment related operations.

- `server/controllers/dashboard.js`
: This file contains the logic for handling dashboard related operations.

- `server/controllers/home.js`
: This file contains the logic for handling home page related operations.

- `server/models/levelPermissions.js`
: This file contains the logic for handling permissions based on user levels.

- `server/models/globalModel.js`
: This file contains the logic for handling global operations.

- `server/models/privacyModel.js`
: This file contains the logic for handling privacy related operations.

## <a name="general-setup" id="general-setup"></a>General Setup

- Requirements
  - MySql: check out MySql Community installation instructions.
  - Node.js: you will need Node.js v16.x or latest Node.js v16.
- Install  
  `npm install pm2 forever cross-env -g`  
  `npm install --force`
  `cp .env.example .env`
- Run  
   `npm start`  
  **_NOTE:_** The .env file must be configured properly before starting.

### <a name="setup-dev-from-scratch-manually-local" id="setup-dev-from-scratch-manually-local"></a>Setup Dev from scrath manualy (local)
#### Frontend and backend setup
- Install MySql and PhpMyAdmin (docker required)  
  `cd Docker && docker-compose up -d`
This will create a MySql DB, PhpMyAdmin and initialize the DB with the required tables.
- PhpMyadmin available: <http://localhost:8080/>

  - Host: mysqldb
  - User: root
  - Pw:example

`npm install pm2 forever cross-env -g`  
`npm install --force`
- adjust: `nodemon.json` for local testing
- Start dev server  
  `npm run dev:start`
- Go to <http://localhost:4000/> and finish installation.
- Sign into the system, user will become admin.  
   Admin panel: <http://localhost:4000/video-admin/settings>  
  **_NOTE:_** The MySql is persistent and saved data to `Docker/db` directory.
#### AI python module backend setup
1. install Django
```shell
sudo apt install python3-django
django-admin --version
4.2.1
```
2. Install packages
```shell
cd backend/ && pip install -r requirements.txt
```
3. development server
```shell
python3 manage.py runserver 
```

#### Run full CookMe App stack  on docker
1. Prepare the environment file:    
   - Copy the example environment file to the actual environment file:   
`cp .env.example .env` 
2. Run the stack: 
igate to the  Docker  directory and run compose:   
`cd Docker && docker-compose -f docker-compose-local.yml up -d`   
The stack will load environment variables from the  .env  file. It will create a MySQL database, PhpMyAdmin, backendgpt, and Nginx as a reverse proxy for these services. Additionally, it will initialize the database with the required tables. 
 
You can access the application using Nginx as the reverse proxy at: [http://localhost:8888/](http://localhost:8888/)
 
PhpMyAdmin is also available at: [http://localhost:8080/](http://localhost:8080/)
- Host: mysqldb 
- User: root 
- Password: example 

**_NOTE:_** To build the image only  run the following command:
```shell
docker build . -t cookme
```
**_NOTE:_** The MySQL data is persistent and saved in the  Docker/db  directory.

## <a name="deployment" id="deployment"></a>Deployment


### Deployment stage


## Go production

On the remote server we have authorization token for ghcr.io.

1. From remote server shell login to repository

```shell
cat CR_PAT | docker login ghcr.io -u Gershon-A --password-stdin
```

2. Connect to github registry from remote server and pull  `docker-compose.ci-prod.yaml` file from repository.
   `git-clone-only-a-specific-file-or-directory.sh`

2. Start the docker-compose

```shell
docker-compose -f docker-compose.ci-prod.yaml up -d
```

3. On the remote server here special service, part of docker compose, watchtower that automatically pull new images from github repository.

4. PhpMyAdmi available <http://104.248.245.102:8585/import.php> .VPN connection requirded.

## <a name="cicd" id="cicd"></a>CI/CD

- Workflows:  
  `version.yaml` - get version. used as reusable workflow.  
  `environment.yaml` - get environment. used as reusable workflow.
  `build.yaml` - Matrix build on different node version of application.  
  `release.yaml` - Creates a tag from release ready for production.
  `push-image.yaml` - Push image with version as tag to GitHup repository (Packages).  
  `smoke-test.yaml` - Bring up the APP stack and make availability test.
  `clenaup-releases.yaml` - Clean up.
  `clenaup-packages.yaml` - remove docker images fro GitHub Packages/Repository leave only 5 latest.   
More info: <https://smart-cooking.atlassian.net/wiki/spaces/SC/pages/1572867/CI+CD>

## <a name="static-directories-and-files" id="static-directories-and-files"></a>Static Directories and Files

- Admin-uploaded images are stored in:  
  `public/static/images/`

- Admin-uploaded videos are stored in:  
  `public/static/videos/`

- Admin-uploaded translations are stored in:  
  `public/locales/`   
  `temporary/cache/languages.json`

- User uploads:
  - Images and videos for story coverage are stored in:  
    `server/public/upload/stories/`


## <a name="generate-site-map" id="generate-site-map"></a>Generate Site Map

To generate the site map, use the script `pages/sitemap.xml.js`.  
You can view the generated site map at: <http://cookme.app/sitemap.xml>.

