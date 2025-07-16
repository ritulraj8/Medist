import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
  <div className="flex flex-row ml-10">
    <div>
      <div className="p-6">
      <div className="flex flex-row">
       <Image src='/images/logo.png' width={60} height={48} alt="Logo" className="w-15 h-12" />
       <h1 className="mt-2 ml-2  text-[#0B3259] font-bold text-3xl">Medist</h1>
      </div>
      <div className='mt-3 ml-5'>
        <h1 className="text-5xl text-[#0B3259] font-bold">Your AI health</h1>
        <h1 className="text-5xl text-[#0B3259] font-bold">platform</h1>
      </div>
      <div className='mt-5 ml-5'>
        <p className='text-[#0B3259] font-normal'>Get answers to your health queries
        <br />
        with responses verified by WHO
        </p>
      </div>
      <div className='p-2 mt-5 ml-5 border-[#c0e0fa] border-2 rounded-lg w-100 h-15 flex flex-row '>
        <Image src='/images/mri scan.png' width={40} height={40} alt="MRI scan" className="w-10 h-10" />
        <p className='mt-2 ml-2'>Upload medical scan/report</p>
      </div>
      <div className='p-2 mt-3 ml-5 border-[#c0e0fa] border-2 rounded-lg w-100 h-13 flex flex-row '>
        <p className='mt-1 ml-1 font-sans'>Ask a health question.</p>
        <Image src='/images/search.png' width={32} height={32} alt="Search" className="w-8 h-8 ml-47" />
      </div>
      <div className="mt-5 ml-5">
        <Link href='/loginpage'>
        <button className='bg-[#2e84cc] w-100 h-10 border-2 rounded-lg border-transparent text-white hover:bg-blue-500 cursor-pointer'>Get started</button>
        </Link>
      </div>
      </div>
    </div>
    <div>
      <Image src='/images/icon.png' width={360} height={360} alt="Hero image" className='w-90 h-90 mt-20 ml-10'/>
    </div>
  </div>
  );
}
