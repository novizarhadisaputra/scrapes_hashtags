const express = require('express')
const app = express()
const port = process.env.port || 8000
const request = require('request-promise')
const mysql = require('mysql')
const $ = require('cheerio')

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "scrapes_hashtags"
})

con.connect((err) => {
    if (err) throw err
    console.log("Connected!")
})
app.get('/', (req, res) => {
    console.log('Hello World!')
})

app.get('/:hashtags', (req, res) => {
    let hashtags = req.params.hashtags
    console.log(hashtags)
    let url = `https://www.instagram.com/explore/tags/${hashtags}/?__a=1`
    let dataset = new Promise((resolve, reject) => {
        request(url).then(data => {
            data_parse = JSON.parse(data)

            let arr_main_data = []
            let data_length = data_parse.graphql.hashtag.edge_hashtag_to_media.edges.length

            for (let i = 0; i < data_length; i++) {
                let id = data_parse.graphql.hashtag.edge_hashtag_to_media.edges[i].node.id
                let pic_url = data_parse.graphql.hashtag.edge_hashtag_to_media.edges[i].node.display_url
                let like_count = data_parse.graphql.hashtag.edge_hashtag_to_media.edges[i].node.edge_liked_by.count
                let comment_count = data_parse.graphql.hashtag.edge_hashtag_to_media.edges[i].node.edge_media_to_comment.count
                main_data = {
                    id_pic: id,
                    pic_url: pic_url,
                    like_count: like_count,
                    comment_count: comment_count
                }
                arr_main_data.push(main_data)
            }
            resolve(arr_main_data)
        })
    }).then((result) => {
        for (let i = 0; i < result.length; i++) {
            let sql = `INSERT INTO hashtag(id_pic, pic_url, like_count, comment_count) VALUES(${result[i].id_pic}, '${result[i].pic_url}', ${result[i].like_count}, ${result[i].comment_count})`
            con.query(sql, (err, result_query) => {
                if(err) console.log(err)
                // console.log(result_query)
            })
        }
    })
})

app.listen(port, () => {
    console.log(`App listening port: ${port}`)
})

//Run app, then load http://localhost:port in a browser to see the output.