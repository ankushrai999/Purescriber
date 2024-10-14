import React from 'react' 

// Functional component 'Header' which renders the navigation bar/header
export default function Header() {
    return (
        <header className='flex items-center justify-between gap-4 p-4'>
            
            {/* Logo/title that redirects to the homepage when clicked */}
            <a href="/">
                <h1 className='font-medium'>
                    Pure<span className='text-purple-600 bold'>Scriber</span> {/* "Scriber" part styled differently */}
                </h1>
            </a>

            {/* Navigation section with links aligned to the right using flexbox */}
            <div className='gap-4 flex items-center'>
                
                {/* "Donate" link which opens in a new tab */}
                <a href="https://buymeacoffee.com/raiankush999" target='_blank' className='text-slate-600 cursor-pointer bold' rel="noreferrer">
                    Donate
                </a>

                {/* "New" button, styled with icons, to possibly create a new item or start a new action */}
                <a href="/" className='flex items-center gap-2 specialBtn px-3 py-2 rounded-lg text-purple-600'>
                    <p>New</p> 
                    <i className="fa-solid fa-plus"></i> {/* Font Awesome icon to display a plus sign */}
                </a>
            </div>
        </header>
    )
}
