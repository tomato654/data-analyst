import axios from 'axios'

// const API_KEY = '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'


async function fetchData() {
    const response = await axios.post("",{
        headers: {
            Authorization: `Bearer ${API_KEY}`
        }
    })
}