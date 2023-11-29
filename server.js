var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql2');
var path = require('path');
const { start } = require('repl');
var connection = mysql.createConnection({
    host: '34.172.127.66',
    user: 'root',
    password: 'Sss020501!',
    database: 'classicmodels'
});


connection.connect;
var app = express();
// set up ejs view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '../public'));


/* GET home page, respond by rendering firstpage.ejs */
app.get('/', function(req, res) {
    res.render('firstpage', { title: 'Home Page' });
});

/* GET login page, respond by  */
app.post('/wish_to_login', function(req, res) {
    res.render('login', { title: 'Login Page' });
});

/* GET register page, respond by  */
app.post('/wish_to_register', function(req, res) {
    res.render('register', { title: 'Register Page' });
});

/* GET register page, respond by  */
app.post('/register', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var country = req.body.country;
    var sql = `INSERT INTO User_login (user_id, pwd, country) VALUES
    ('${username}', '${password}', '${country}')`;
    console.log(sql);
    connection.query(sql, function(err, result) {
        if (err) {
            res.redirect('/login_failure');
            return;
        }
        res.redirect('/choosecountry');
    });
});

/* GET login page, respond by  */
app.post('/login', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var sql = `SELECT * FROM User_login WHERE user_id = '${username}' && pwd = '${password}'`;
    console.log(sql);
    connection.query(sql, function(err, result) {
        if (err) {
            res.redirect('/login_failure');
            return;
        }
        res.redirect('/choosecountry');
    });
});

/* GET login_failure page, respond by  */
app.get('/login_failure', function(req, res) {
    res.render('login_failure', { title: 'Login Failure' });
});

/* GET login_back page, respond by  */
app.post('/login_back', function(req, res) {
    res.redirect('/');
});

/* GET choose_country page, respond by  */
app.get('/choosecountry', function(req, res) {
    res.render('choosecountry', { title: 'Choose Country' });
});


app.post('/solo_country', function(req, res) {
    var myarr= [];
    var sql;
    var country = req.body.dropdown1;
    var startDate = req.body.startDate + '%';
    var endDate = req.body.endDate + '%';
    var table_choice = req.body.dropdown2;
    

    if(table_choice == "most_views") {
        sql = `SELECT v.v_id,channel_title, title, view_count
        FROM ${country} v JOIN Channel ch ON v.channel_id = ch.channel_id JOIN HasTrendingDate h ON v.v_id = h.v_id 
        WHERE dates LIKE '${startDate}' OR dates LIKE '${endDate}'
        ORDER BY view_count 
        DESC LIMIT 100`;
    }
    else if (table_choice == "most_commented") {
        sql =  `SELECT channel_title, title, view_count, comment_count
        FROM ${country} v JOIN Channel ch ON v.channel_id = ch.channel_id JOIN HasTrendingDate h ON v.v_id = h.v_id 
        WHERE dates LIKE '${startDate}' OR dates LIKE '${endDate}'
        ORDER BY comment_count DESC 
        LIMIT 100`;
    }
    else if(table_choice == "most_liked") {
        sql =  `SELECT channel_title, title, view_count, likes
        FROM ${country} v JOIN Channel ch ON v.channel_id = ch.channel_id JOIN HasTrendingDate h ON v.v_id = h.v_id 
        WHERE dates LIKE '${startDate}' OR dates LIKE '${endDate}'
        ORDER BY likes DESC 
        LIMIT 100`;
    }
    else if(table_choice == "most_disliked"){
        sql =  `SELECT channel_title, title, view_count, dislikes
        FROM ${country} v JOIN Channel ch ON v.channel_id = ch.channel_id JOIN HasTrendingDate h ON v.v_id = h.v_id 
        WHERE dates LIKE '${startDate}' OR dates LIKE '${endDate}' 
        ORDER BY dislikes DESC 
        LIMIT 100`;
    }
    else if(table_choice == "category_bar_graph") {
        sql = `SELECT cat_title, COUNT(v_id) AS category_count , SUM(view_count) AS numViews, SUM(likes) AS numLikes 
        FROM Videos v JOIN Category c ON v.cat_id=c.cat_id
        GROUP BY cat_title
        ORDER BY category_count DESC, numViews DESC, numLikes DESC`;
    }
    else if(table_choice == "channel_likes") {
        sql = `SELECT like_count.channel_title, Like_vid_num, like_count.avg_view
        FROM (
        SELECT c.channel_title, v.channel_id, COUNT(likes) AS Like_vid_num, AVG(view_count) AS avg_view
        FROM Videos v JOIN Channel c ON (v.channel_id = c.channel_id) 
        WHERE likes > 5000
        GROUP BY c.channel_id
        ) AS like_count
        WHERE Like_vid_num > 8 
        ORDER BY Like_vid_num DESC
        `;
    }
    else if(table_choice == "channel_dislikes") {
        sql = `SELECT dislike_count.channel_title, Dislike_vid_num, dislike_count.avg_view
        FROM (
        SELECT c.channel_title, v.channel_id, COUNT(dislikes) AS Dislike_vid_num, AVG(view_count) AS avg_view
        FROM Videos v JOIN Channel c ON (v.channel_id = c.channel_id) 
        WHERE dislikes > 5000
        GROUP BY c.channel_id
        ) AS dislike_count
        WHERE Dislike_vid_num > 8 
        ORDER BY Dislike_vid_num DESC
        `;
    }

    /*
    sql = `IF  NOT EXISTS (SELECT * FROM LikedVideo WHERE v_id = ?)
    BEGIN
    INSERT INTO LikedVideo (v_id) VALUES (v_id, title)
    END
    `;
    */

    console.log(sql);
    
    connection.query(sql, function(err, rows) {
        if (err) {
            res.send(err);
            return;
        } else {
            if(table_choice == "category_bar_graph") {
                var lng = rows.length;
                var total_videos = 0;
                for (var i = 0; i < lng; i++) {
                    total_videos += rows[i].category_count;
                }
                for (var i = 0; i < lng; i++) {
                    var video = {
                        'cat_title':rows[i].cat_title,
                        'cat_count':rows[i].category_count/total_videos*100,
                    }
                    myarr.push(video);
                }
                console.log(rows);
                res.render('cat_bar', {title: (table_choice), "myarr": (myarr)});  
            } 
            else if(table_choice == "most_commented") {
                var lng = rows.length;
                for (var i = 0; i < lng; i++) {
                    //Create an object to save current row's data
                    var video = {
                        'channel_title':rows[i].channel_title,
                        'title':rows[i].title,
                        'comment_count': rows[i].comment_count,
                    }
                    // Add object into array
                    myarr.push(video);
                }
                // Render index page using array 
                console.log(rows);
                res.render('most_comments', {title: (table_choice), "myarr": (myarr)});   
            }
            else if(table_choice == "most_liked") {
                var lng = rows.length;
                for (var i = 0; i < lng; i++) {
                    //Create an object to save current row's data
                    var video = {
                        'channel_title':rows[i].channel_title,
                        'title':rows[i].title,
                        'likes': rows[i].likes,
                    }
                    // Add object into array
                    myarr.push(video);
                }
                // Render index page using array 
                console.log(rows);
                res.render('most_likes', {title: (table_choice), "myarr": (myarr)});   
            }
            else if(table_choice == "most_disliked") {
                var lng = rows.length;
                for (var i = 0; i < lng; i++) {
                    //Create an object to save current row's data
                    var video = {
                        'channel_title':rows[i].channel_title,
                        'title':rows[i].title,
                        'dislikes': rows[i].dislikes,
                    }
                    // Add object into array
                    myarr.push(video);
                }
                // Render index page using array 
                res.render('most_dislikes', {title: (table_choice), "myarr": (myarr)});   
            }
            else if(table_choice == "most_views"){
                var lng = rows.length;
                for (var i = 0; i < lng; i++) {
                    //Create an object to save current row's data
                    var video = {
			'v_id': rows[i].v_id,
                        'channel_title':rows[i].channel_title,
                        'title':rows[i].title,
                        'view_count': rows[i].view_count,
                    }
                    // Add object into array
                    myarr.push(video);
                }
                // Render index page using array 
                console.log(rows);
                res.render('most_views', {title: (table_choice), "myarr": (myarr)});   
            }
            else if(table_choice == "channel_likes") {
                var lng = rows.length;
                for (var i = 0; i < lng; i++) {
                    //Create an object to save current row's data
                    var video = {
                        'channel_title':rows[i].channel_title,
                        'title':rows[i].title,
                        'likes': rows[i].Like_vid_num,
                    }
                    // Add object into array
                    myarr.push(video);
                }
                // Render index page using array 
                console.log(rows);
                res.render('channel_likes', {title: (table_choice), "myarr": (myarr)});   
            }
            else if(table_choice == "channel_dislikes") {
                var lng = rows.length;
                for (var i = 0; i < lng; i++) {
                    //Create an object to save current row's data
                    var video = {
                        'channel_title':rows[i].channel_title,
                        'title':rows[i].title,
                        'dislikes': rows[i].Dislike_vid_num,
                    }
                    // Add object into array
                    myarr.push(video);
                }
                // Render index page using array 
                console.log(rows);
                res.render('channel_dislikes', {title: (table_choice), "myarr": (myarr)});   
            }
        }
    });
});

app.post('/multi_countries', function(req, res) {
    var myarr= [];
    var cmp_arr=[];
    var sql;
    var country1 = req.body.dropdown3;
    var country2 = req.body.dropdown4;
    
    sql = `select country, sum(view_count) as view_count, sum(likes) as likes, 
    sum(dislikes) as dislikes, sum(comment_count) as comment_count 
    from World_Videos 
    where country =  '${country1}' OR country =  '${country2}' group by country;`

    console.log(sql);
    
    connection.query(sql, function(err, rows) {
        if (err) {
            res.send(err);
            return;
        } else {
            var lng = rows.length;
            for (var i = 0; i < lng; i++) {
                var video = {
                    'view_count':rows[i].view_count,
                    'likes':rows[i].likes,
                    'dislikes':rows[i].dislikes,
                    'comment_count':rows[i].comment_count,
                }
                myarr.push(video);
            }
            console.log(rows);
            console.log(myarr);
            var index1 = {
                'value_1':myarr[0]["view_count"],
                'value_2':myarr[1]["view_count"],
            }
            var index2 = {
                'value_1':myarr[0]["likes"],
                'value_2':myarr[1]["likes"],
            }
            var index3 = {
                'value_1':myarr[0]["dislikes"],
                'value_2':myarr[1]["dislikes"],
            }
            var index4 = {
                'value_1':myarr[0]["comment_count"],
                'value_2':myarr[1]["comment_count"],
            }
            cmp_arr.push(index1);
            cmp_arr.push(index2);
            cmp_arr.push(index3);
            cmp_arr.push(index4);

            
            console.log(cmp_arr);
            res.render('compare_countries', {Country1: (country1), Country2: (country2), "cmp_arr": (cmp_arr)});  
            
            
        }
    });
});

// app.post('/addfavorite', function(req, res) {
//     var username = req.body.username;
//     var v_id = req.body.video_id;
//     var sql1 = `IF  NOT EXISTS (SELECT * FROM LikedVideo WHERE v_id = ?)
//     BEGIN
//     INSERT INTO LikedVideo (v_id) VALUES (v_id, title)
//     END
//     ;`
//     var sql2 = ``;
//     console.log(sql);
//     connection.query(sql, function(err, result) {
//         if (err) {
//             res.send(err);
//             return;
//         }
//         res.redirect('/choosecountry');
//     });
// });


/* GET login page, respond by  */
app.post('/modified_favorite_videos', function(req, res) {
    res.render('ModifyFavoriteVideos');
});

//Testing add favorite v2
app.post('/addfavorite', function(req, res) {
    var favoriteVideos= [];
    var sql;
    var sql2;
    var username = req.body.username;
    var v_id = req.body.video_id;
    sql = `INSERT INTO LikedVideo (v_id, user_id) VALUES ('${v_id}', '${username}')`;
    sql2 = `SELECT v_id, title
    FROM LikedVideo lv NATURAL JOIN Videos v
    WHERE user_id LIKE '${username}'`;    
    console.log(sql);
    connection.query(sql, function(err, res) {
        if (err) {
            res.send(err);
            return;
        }
    });
    connection.query(sql2, function(err, rows) {
        if (err) {
            res.send(err);
            return;
        } else {
            var lng = rows.length;
            for (var i = 0; i < lng; i++) {
                //Create an object to save current row's data
                var video = {
                    'title':rows[i].title,
                    'video_id': rows[i].v_id,
                }
                // Add object into array
                favoriteVideos.push(video);
            }
            res.render('view_favorite_videos',{title: "Fav Videos", "myarr": favoriteVideos});/*  */
        }
    });
});


//Testing delete favorite
app.post('/deletefavorite', function(req, res) {
    var favoriteVideos= [];
    var sql;
    var sql2;
    var username = req.body.username;
    var video_id = req.body.videoid;
    
    sql = `DELETE FROM LikedVideo WHERE user_id = '${username}' AND v_id = '${video_id}'`
    sql2 = `SELECT v_id, title
           FROM LikedVideo lv NATURAL JOIN Videos v
           WHERE user_id LIKE '${username}'`;    
           
    console.log(sql);
    console.log(sql2);
    connection.query(sql, function(err, res) {
        if (err) {
            res.send(err);
            return;
        }
    });
    connection.query(sql2, function(err, rows) {
        if (err) {
            res.send(err);
            return;
        } else {
            var lng = rows.length;
            for (var i = 0; i < lng; i++) {
                //Create an object to save current row's data
                var video = {
                    'title':rows[i].title,
                    'video_id': rows[i].v_id,
                }
                // Add object into array
                favoriteVideos.push(video);
            }
            res.render('view_favorite_videos',{title: "Fav Videos", "myarr": favoriteVideos});/*  */
        }
    });
});

app.listen(80, function () {
    console.log('Node app is running on port 80');
});;
