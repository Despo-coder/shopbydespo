'use client'
import React, { useEffect, useState } from 'react';
import { SignedIn, UserButton, SignedOut, SignInButton } from '@clerk/nextjs';

const Header = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch('/api/checkuser');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    };
    fetchUser();
  }, []);

//console.log(user)

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-container">
          <h2>Expense Tracker</h2>
          <div>
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;
