@extends('layouts.admin')

@section('title', 'Menu Editor')

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Menu Editor</h1>
    </div>

    @if(session('success'))
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {{ session('success') }}
        </div>
    @endif

    @if($errors->any())
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <ul class="list-disc list-inside">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <!-- Add New Menu Item -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">Add Menu Item</h2>
        <form action="{{ route('admin.menu.store') }}" method="POST">
            @csrf
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Label</label>
                    <input type="text" name="label" placeholder="e.g., About Us" required 
                           class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">URL</label>
                    <input type="text" name="href" placeholder="e.g., /about" required 
                           class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                    <input type="number" name="sort_order" value="{{ ($menuItems->max('sort_order') ?? 0) + 10 }}" 
                           class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="is_active" checked class="w-4 h-4 text-blue-600 rounded">
                        <span class="text-sm font-medium text-gray-700">Active</span>
                    </label>
                </div>
                <div>
                    <button type="submit" class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                        Add Item
                    </button>
                </div>
            </div>
        </form>
    </div>

    <!-- Menu Items List -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Order</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Actions</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                @forelse($menuItems as $item)
                <tr class="{{ $item->is_active ? '' : 'bg-gray-50 opacity-60' }}">
                    <form action="{{ route('admin.menu.update', $item->id) }}" method="POST" id="form-{{ $item->id }}">
                        @csrf
                        @method('PUT')
                        <td class="px-6 py-4">
                            <input type="number" name="sort_order" value="{{ $item->sort_order }}" 
                                   class="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </td>
                        <td class="px-6 py-4">
                            <input type="text" name="label" value="{{ $item->label }}" required
                                   class="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </td>
                        <td class="px-6 py-4">
                            <input type="text" name="href" value="{{ $item->href }}" required
                                   class="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </td>
                        <td class="px-6 py-4">
                            <label class="flex items-center cursor-pointer">
                                <input type="checkbox" name="is_active" {{ $item->is_active ? 'checked' : '' }} 
                                       class="w-4 h-4 text-blue-600 rounded">
                                <span class="ml-2 text-sm {{ $item->is_active ? 'text-green-600' : 'text-gray-400' }}">
                                    {{ $item->is_active ? 'Active' : 'Hidden' }}
                                </span>
                            </label>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex gap-2">
                                <button type="submit" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    Save
                                </button>
                    </form>
                                <form action="{{ route('admin.menu.destroy', $item->id) }}" method="POST" 
                                      onsubmit="return confirm('Delete this menu item?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="text-red-600 hover:text-red-800 text-sm font-medium">
                                        Delete
                                    </button>
                                </form>
                            </div>
                        </td>
                </tr>
                @empty
                <tr>
                    <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                        <div class="flex flex-col items-center">
                            <svg class="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                            <p class="text-lg font-medium">No menu items yet</p>
                            <p class="text-sm">Add your first menu item using the form above.</p>
                        </div>
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- Preview -->
    @if($menuItems->count() > 0)
    <div class="mt-6 bg-gray-800 rounded-lg p-4">
        <h3 class="text-white font-semibold mb-3">Menu Preview</h3>
        <nav class="flex flex-wrap gap-4">
            @foreach($menuItems->where('is_active', true) as $item)
                <a href="#" class="text-gray-300 hover:text-white transition">{{ $item->label }}</a>
            @endforeach
        </nav>
    </div>
    @endif
</div>
@endsection
