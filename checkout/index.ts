import express from 'express'

const app = express()
app.get('/', (req, res) => {
    res.send('Server is running')
})

app.listen(4000, () => {
    console.log('Server listening on port 4000')
})
