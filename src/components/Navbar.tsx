<header 
      className={cn(
        "fixed top-0 left-0 w-full z-40 transition-all duration-300",
        isScrolled ? "bg-hype-dark/90 backdrop-blur-sm shadow-lg py-2" : "bg-gradient-to-b from-hype-dark/90 to-transparent py-3"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-hype-orange to-hype-purple bg-clip-text text-transparent">
              HypeStream
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <DesktopNavigation />

          {/* Right Side - Search, Notifications, Profile */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Search */}
            <SearchBar 
              isOpen={isMobile ? isSearchOpen : true}
              onToggle={toggleSearch}
              className="z-20"
            />

            {/* Notifications */}
            {session && (
              <NotificationsMenu
                notifications={notifications}
                unreadCount={unreadCount}
                markAsRead={markNotificationsAsRead}
              />
            )}

            {/* User Menu or Login Button */}
            <UserMenu 
              session={session} 
              onSignOut={handleSignOut}
              onDeleteAccount={handleDeleteAccount}
            />
            
            {/* Mobile Menu Toggle */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="ml-1 text-foreground"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobile && isMenuOpen && (
        <MobileNavigation 
          session={session}
          onSignOut={handleSignOut}
          onDeleteAccount={handleDeleteAccount}
        />
      )}
