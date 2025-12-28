<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Admin') - Molochain CMS</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        [x-cloak] { display: none !important; }
    </style>
</head>
<body class="bg-gray-100 min-h-screen">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <a href="{{ url('/dashboard') }}" class="text-xl font-bold text-gray-900">
                        Molochain CMS
                    </a>
                    <div class="hidden md:flex ml-10 space-x-4">
                        <a href="{{ url('/dashboard') }}" class="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                            Dashboard
                        </a>
                        <a href="{{ route('admin.settings.index') }}" class="px-3 py-2 {{ request()->routeIs('admin.settings.*') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' }} rounded-md">
                            Settings
                        </a>
                        <a href="{{ route('admin.menu.index') }}" class="px-3 py-2 {{ request()->routeIs('admin.menu.*') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' }} rounded-md">
                            Menu
                        </a>
                        <a href="{{ route('admin.home-sections.index') }}" class="px-3 py-2 {{ request()->routeIs('admin.home-sections.*') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' }} rounded-md">
                            Home Sections
                        </a>
                    </div>
                </div>
                <div class="flex items-center">
                    @auth
                        <span class="text-gray-600 mr-4">{{ auth()->user()->name ?? auth()->user()->email }}</span>
                        <form method="POST" action="{{ url('/logout') }}" class="inline">
                            @csrf
                            <button type="submit" class="text-gray-600 hover:text-gray-900">Logout</button>
                        </form>
                    @endauth
                </div>
            </div>
        </div>
        
        <!-- Mobile menu -->
        <div class="md:hidden border-t">
            <div class="px-2 pt-2 pb-3 space-y-1">
                <a href="{{ url('/dashboard') }}" class="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Dashboard</a>
                <a href="{{ route('admin.settings.index') }}" class="block px-3 py-2 {{ request()->routeIs('admin.settings.*') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100' }} rounded-md">Settings</a>
                <a href="{{ route('admin.menu.index') }}" class="block px-3 py-2 {{ request()->routeIs('admin.menu.*') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100' }} rounded-md">Menu</a>
                <a href="{{ route('admin.home-sections.index') }}" class="block px-3 py-2 {{ request()->routeIs('admin.home-sections.*') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100' }} rounded-md">Home Sections</a>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="py-6">
        @yield('content')
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t mt-auto py-4">
        <div class="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
            &copy; {{ date('Y') }} Molochain CMS. All rights reserved.
        </div>
    </footer>
</body>
</html>
