# NodeJS API with MySQL database

# MySQL database

database name : Demo

-- Table: category

CREATE TABLE category (
  id int(10) unsigned NOT NULL AUTO_INCREMENT,
  title varchar(255) NOT NULL,
  parent_id int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (parent_id) REFERENCES category (id) 
    ON DELETE CASCADE ON UPDATE CASCADE
);

Inserting data

INSERT INTO category(title,parent_id) VALUES('Electronics',NULL);
INSERT INTO category(title,parent_id) VALUES('Laptops & PC',1);
 
INSERT INTO category(title,parent_id) VALUES('Laptops',2);
INSERT INTO category(title,parent_id) VALUES('PC',2);
 
INSERT INTO category(title,parent_id) VALUES('Cameras & photo',1);
INSERT INTO category(title,parent_id) VALUES('Camera',5);
 
INSERT INTO category(title,parent_id) VALUES('Phones & Accessories',1);
INSERT INTO category(title,parent_id) VALUES('Smartphones',7);
 
INSERT INTO category(title,parent_id) VALUES('Android',8);
INSERT INTO category(title,parent_id) VALUES('iOS',8);
INSERT INTO category(title,parent_id) VALUES('Other Smartphones',8);
 
INSERT INTO category(title,parent_id) VALUES('Batteries',7);
INSERT INTO category(title,parent_id) VALUES('Headsets',7);
INSERT INTO category(title,parent_id) VALUES('Screen Protectors',7);


# .env file configuraction

setup your database credentials into .env file


# npm 

1) npm install

After installing run below command : 

4) node server.js

