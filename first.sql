
-- 创建数据库
create database test;

-- 切换到test数据库
use test;

-- 创建表 
create table if not exists users (
  id int auto_increment,
  name varchar(20) not null,
  age int not null,
  wx varchar(20),

  primary key (id)
) engine=InnoDB default charset=utf8;

-- 插入数据
insert into users (id,name,age,wx) value (1,'znq',24,'adsvdfbfgsfdsd');
insert into users (name,age,wx) value ('znq',24,'adsvdfbfgsfdsd');

-- 更新数据
update users set age=21 where id=1;

delete from users where id=1;

-- 创建豆瓣书籍表 
create table if not exists doubanBooks (
  id int auto_increment,
  title varchar(100) not null,
  evaluateNumber float not null,
  evaluatestar float not null,
  cover_url varchar(100) not null,
  author varchar(30) not null,
  press varchar(30) not null,
  pubDate varchar(20) not null,
  abstract varchar(10000) not null,
  primary key (id)
) engine=InnoDB default charset=utf8;
-- 插入数据
insert into doubanBooks (title,evaluateNumber,evaluatestar,cover_url,author,press,pubDate,abstract) value ("1212",4.5,9,'http://img','ssss','ssss','2018-08','sssds');