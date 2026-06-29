import Link from 'next/link';
import React from 'react';

function EmptyState() {
  return (
    <div className='p-5 py-24 flex items-center flex-col mt-10 border-2 border-dashed'>
      <h2>Your imagination seems to be empty</h2>
      <Link href={'/dashboard/create-new'}>
     <button className="bg-purple-600 text-white rounded-md px-6 py-3 text-base font-semibold">Create your first imagination</button>
     </Link>
    </div>
  );
}

export default EmptyState;
