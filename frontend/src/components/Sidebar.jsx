import logo from '../assets/logo.png';
import logo4 from '../assets/logo4.png';
import { IoMdHome } from "react-icons/io";
import { BsGrid1X2 } from "react-icons/bs";
import { CiHeart } from "react-icons/ci";
import { CiHeadphones } from "react-icons/ci";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faEllipsisH } from '@fortawesome/free-solid-svg-icons';

const Sidebar = () => {
return (
<div className='bg-gradient-to-1 from-black to-gray-700'>
<div className='mt-3 py-2 px-2'>
<img src={logo} className='mt-1 w-44 hidden md:block cursor-pointer' />
<img src={logo4} className='mt-1 w-44 block md:hidden cursor-pointer' />
</div>



<div className='flex flex-row items-center justify-center gap-5 py-2 px-2'>
<div className='bg-red-500 w-full flex flex-row items-center justify-center gap-2 py-2 px-2 rounded-1g cursor-pointer'>
<IoMdHome className='text-2xl text-white' />
<p className='text-1g font-semibold hidden md:block text-white'>Home</p>
</div>


      <div className='flex flex-row items-center justify-center gap-5 py-2 px-2'>
        <div
          onClick={() => navigate('/list-songs')}
          className='hover:bg-red-500 w-full flex flex-row items-center justify-center gap-2 py-2 px-2 rounded-1g cursor-pointer'
        >
          <CiHeadphones className='text-2xl text-white' />
          <p className='text-1g font-semibold hidden md:block text-purple-500'>Gallery</p>
        </div>
      </div>
    
  


</div>
<div className='flex flex-row items-center justify-center gap-5 py-2 px-2'>
<div className='hover:bg-red-500 w-full flex flex-row items-center justify-center gap-2 py-2 px-2 rounded-1g cursor-pointer'>
<BsGrid1X2 className='text-2xl text-white'/>
<p className='text-1g font-semibold hidden md:block text-green'>Browser</p>
</div>
</div>
<div className='flex flex-row items-center justify-center gap-5 py-2 px-2'>
<div className='hover:bg-red-500 w-full flex flex-row items-center justify-center gap-2 py-2 px-2 rounded-1g cursor-pointer'>
<CiHeart className='text-2xl text-green-500' />
<p className='text-1g font-semibold hidden md:block text-green-500'>Favorite</p>
</div>
</div>
<div className='flex flex-row items-center justify-center gap-5 py-2 px-2'>
<div className='hover:bg-red-500 w-full flex flex-row items-center justify-center gap-2 py-2 px-2 rounded-1g cursor-pointer'>
<IoMdHome className='text-2xl text-white' />


<p className='text-1g font-semibold hidden md:block text-green-500'>Home</p>

</div>
</div>
</div>
)
}
export default Sidebar;