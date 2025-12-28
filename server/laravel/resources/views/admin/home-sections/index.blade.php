@extends('layouts.admin')

@section('title', 'Home Sections')

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Home Sections Editor</h1>
        <a href="{{ url('/') }}" target="_blank" class="text-blue-600 hover:text-blue-800 flex items-center gap-1">
            <span>View Website</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
        </a>
    </div>

    @if(session('success'))
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {{ session('success') }}
        </div>
    @endif

    @if(session('error'))
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {{ session('error') }}
        </div>
    @endif

    <div class="grid gap-6">
        @foreach($sections as $section)
        <div class="bg-white rounded-lg shadow overflow-hidden">
            <div class="flex justify-between items-start p-6">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <span class="inline-flex px-3 py-1 text-sm font-semibold rounded-full
                            @if($section->key === 'hero') bg-purple-100 text-purple-800
                            @elseif($section->key === 'services') bg-blue-100 text-blue-800
                            @elseif($section->key === 'ecosystem') bg-green-100 text-green-800
                            @elseif($section->key === 'cta') bg-orange-100 text-orange-800
                            @else bg-gray-100 text-gray-800
                            @endif">
                            {{ strtoupper($section->key) }}
                        </span>
                        <span class="text-sm {{ $section->is_active ? 'text-green-600' : 'text-gray-400' }}">
                            {{ $section->is_active ? '● Active' : '○ Inactive' }}
                        </span>
                        <span class="text-sm text-gray-400">
                            Order: {{ $section->sort_order }}
                        </span>
                    </div>
                    <h2 class="text-xl font-bold text-gray-900 mb-1">{{ $section->title }}</h2>
                    @if($section->subtitle)
                        <p class="text-gray-600 mb-2">{{ $section->subtitle }}</p>
                    @endif
                    @if($section->body)
                        <p class="text-gray-500 text-sm">{{ Str::limit($section->body, 150) }}</p>
                    @endif
                    @if($section->items)
                        <div class="mt-3">
                            <span class="text-xs text-gray-400">Has {{ count(json_decode($section->items)) }} items</span>
                        </div>
                    @endif
                </div>
                <div class="ml-4">
                    <a href="{{ route('admin.home-sections.edit', $section->id) }}" 
                       class="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Edit
                    </a>
                </div>
            </div>
            
            <!-- Preview Bar -->
            <div class="bg-gray-50 px-6 py-3 border-t">
                <div class="flex items-center justify-between text-sm text-gray-500">
                    <span>Last updated: {{ \Carbon\Carbon::parse($section->updated_at)->diffForHumans() }}</span>
                    <span>ID: {{ $section->id }}</span>
                </div>
            </div>
        </div>
        @endforeach
    </div>

    <!-- Info Box -->
    <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 class="font-semibold text-blue-900 mb-2">Section Types</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
                <span class="font-medium text-purple-700">Hero</span>
                <p class="text-gray-600">Main banner at the top of homepage</p>
            </div>
            <div>
                <span class="font-medium text-blue-700">Services</span>
                <p class="text-gray-600">Core services showcase with icons</p>
            </div>
            <div>
                <span class="font-medium text-green-700">Ecosystem</span>
                <p class="text-gray-600">Platform features and architecture</p>
            </div>
            <div>
                <span class="font-medium text-orange-700">CTA</span>
                <p class="text-gray-600">Call-to-action buttons and text</p>
            </div>
        </div>
    </div>
</div>
@endsection
