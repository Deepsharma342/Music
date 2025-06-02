import { useContext, useEffect, useState } from "react"
import { PlayerContext } from "../context/PlayerContext"
import axios from "axios"
import MusicCard from "../components/MusicCard"

const ListSong = () => {
const { backendUrl } = useContext(PlayerContext)
const [musics, setMusics] = useState([])
const fetchSongs = async () => {
try {
const {data } = await axios.get(`${backendUrl}/api/admin/get-music`)
if (data.success) {
setMusics(data.musics)
}
} catch (error) {
console.log(error)
}
}

useEffect(() => {
fetchSongs()
}, [])

return (
<div className="px-4 py-6">
<h1 className="text-3xl font-bold text-center mb-8">Music Library</h1>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
{musics.map((music) => (
<MusicCard key={music._id} music={music} fetchSongs={fetchSongs} />
))}
</div>
</div>
)
}
export default ListSong