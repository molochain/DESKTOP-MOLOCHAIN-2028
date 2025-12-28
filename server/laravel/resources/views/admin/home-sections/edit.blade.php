@extends('layouts.admin')

@section('title', 'Edit ' . ucfirst($section->key) . ' Section')

@section('content')
<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="mb-6">
        <a href="{{ route('admin.home-sections.index') }}" class="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Sections
        </a>
    </div>

    <div class="flex items-center gap-3 mb-6">
        <span class="inline-flex px-3 py-1 text-sm font-semibold rounded-full
            @if($section->key === 'hero') bg-purple-100 text-purple-800
            @elseif($section->key === 'services') bg-blue-100 text-blue-800
            @elseif($section->key === 'ecosystem') bg-green-100 text-green-800
            @elseif($section->key === 'cta') bg-orange-100 text-orange-800
            @else bg-gray-100 text-gray-800
            @endif">
            {{ strtoupper($section->key) }}
        </span>
        <h1 class="text-2xl font-bold text-gray-900">Edit Section</h1>
    </div>

    @if($errors->any())
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <ul class="list-disc list-inside">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form action="{{ route('admin.home-sections.update', $section->id) }}" method="POST" class="bg-white rounded-lg shadow">
        @csrf
        @method('PUT')
        
        <div class="p-6 space-y-6">
            <!-- Title -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input type="text" name="title" value="{{ old('title', $section->title) }}" required
                       class="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <p class="mt-1 text-sm text-gray-500">Main heading for this section</p>
            </div>

            <!-- Subtitle -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <input type="text" name="subtitle" value="{{ old('subtitle', $section->subtitle) }}"
                       class="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <p class="mt-1 text-sm text-gray-500">Secondary text displayed below the title</p>
            </div>

            <!-- Body -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Body Content</label>
                <textarea name="body" rows="4"
                          class="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">{{ old('body', $section->body) }}</textarea>
                <p class="mt-1 text-sm text-gray-500">Main paragraph text for this section</p>
            </div>

            <!-- Items (JSON) -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Items (JSON)</label>
                <textarea name="items" rows="8"
                          class="w-full border border-gray-300 rounded-md px-4 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">{{ old('items', $section->items) }}</textarea>
                <p class="mt-1 text-sm text-gray-500">
                    JSON array of items (for services, buttons, etc.). Leave empty if not applicable.
                </p>
                
                @if($section->key === 'services')
                <div class="mt-3 bg-gray-50 rounded-md p-3">
                    <p class="text-xs font-medium text-gray-700 mb-2">Example format for services:</p>
                    <pre class="text-xs text-gray-600 overflow-x-auto">[
  {"icon": "truck", "title": "Road Transport", "description": "FTL/LTL services"},
  {"icon": "ship", "title": "Ocean Freight", "description": "Container shipping"}
]</pre>
                </div>
                @endif

                @if($section->key === 'cta')
                <div class="mt-3 bg-gray-50 rounded-md p-3">
                    <p class="text-xs font-medium text-gray-700 mb-2">Example format for CTA buttons:</p>
                    <pre class="text-xs text-gray-600 overflow-x-auto">[
  {"type": "primary", "label": "Get Started", "href": "/contact"},
  {"type": "secondary", "label": "Learn More", "href": "/about"}
]</pre>
                </div>
                @endif
            </div>

            <!-- Active Status -->
            <div class="flex items-center gap-3 pt-4 border-t">
                <label class="flex items-center cursor-pointer">
                    <input type="checkbox" name="is_active" {{ $section->is_active ? 'checked' : '' }}
                           class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500">
                    <span class="ml-3 text-sm font-medium text-gray-700">Active (visible on website)</span>
                </label>
            </div>
        </div>

        <!-- Footer Actions -->
        <div class="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
            <span class="text-sm text-gray-500">
                Last updated: {{ \Carbon\Carbon::parse($section->updated_at)->format('M d, Y H:i') }}
            </span>
            <div class="flex gap-3">
                <a href="{{ route('admin.home-sections.index') }}" 
                   class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">
                    Cancel
                </a>
                <button type="submit" 
                        class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                    Save Changes
                </button>
            </div>
        </div>
    </form>

    <!-- Preview Section -->
    <div class="mt-6 bg-gray-800 rounded-lg p-6">
        <h3 class="text-white font-semibold mb-4">Live Preview</h3>
        <div class="text-center">
            <h2 class="text-2xl md:text-3xl font-bold text-white mb-2">{{ $section->title }}</h2>
            @if($section->subtitle)
                <p class="text-lg text-gray-300 mb-3">{{ $section->subtitle }}</p>
            @endif
            @if($section->body)
                <p class="text-gray-400">{{ $section->body }}</p>
            @endif
        </div>
    </div>
</div>
@endsection
