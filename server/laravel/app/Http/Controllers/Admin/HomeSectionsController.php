<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HomeSectionsController extends Controller
{
    public function index()
    {
        $sections = DB::table('home_sections')->orderBy('sort_order')->get();
        return view('admin.home-sections.index', compact('sections'));
    }

    public function edit($id)
    {
        $section = DB::table('home_sections')->where('id', $id)->first();
        
        if (!$section) {
            return redirect()->route('admin.home-sections.index')->with('error', 'Section not found!');
        }
        
        return view('admin.home-sections.edit', compact('section'));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'body' => 'nullable|string'
        ]);

        DB::table('home_sections')->where('id', $id)->update([
            'title' => $request->title,
            'subtitle' => $request->subtitle,
            'body' => $request->body,
            'items' => $request->items,
            'is_active' => $request->has('is_active'),
            'updated_at' => now()
        ]);

        return redirect()->route('admin.home-sections.index')->with('success', 'Section updated successfully!');
    }
}
