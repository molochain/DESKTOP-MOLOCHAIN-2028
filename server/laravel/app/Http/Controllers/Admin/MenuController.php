<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MenuController extends Controller
{
    public function index()
    {
        $menuItems = DB::table('menu_items')->orderBy('sort_order')->get();
        return view('admin.menu.index', compact('menuItems'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'label' => 'required|string|max:255',
            'href' => 'required|string|max:255',
            'sort_order' => 'required|integer'
        ]);

        DB::table('menu_items')->insert([
            'label' => $request->label,
            'href' => $request->href,
            'parent_id' => $request->parent_id ?: null,
            'sort_order' => $request->sort_order,
            'is_active' => $request->has('is_active'),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return redirect()->route('admin.menu.index')->with('success', 'Menu item added successfully!');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'label' => 'required|string|max:255',
            'href' => 'required|string|max:255',
            'sort_order' => 'required|integer'
        ]);

        DB::table('menu_items')->where('id', $id)->update([
            'label' => $request->label,
            'href' => $request->href,
            'sort_order' => $request->sort_order,
            'is_active' => $request->has('is_active'),
            'updated_at' => now()
        ]);

        return redirect()->route('admin.menu.index')->with('success', 'Menu item updated successfully!');
    }

    public function destroy($id)
    {
        DB::table('menu_items')->where('id', $id)->delete();
        return redirect()->route('admin.menu.index')->with('success', 'Menu item deleted successfully!');
    }
}
