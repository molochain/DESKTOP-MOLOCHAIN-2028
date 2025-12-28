<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = DB::table('settings')->orderBy('group')->orderBy('key')->get();
        return view('admin.settings.index', compact('settings'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'key' => 'required|string|unique:settings,key',
            'value' => 'nullable|string',
            'group' => 'required|string'
        ]);

        DB::table('settings')->insert([
            'key' => $request->key,
            'value' => $request->value,
            'group' => $request->group,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return redirect()->route('admin.settings.index')->with('success', 'Setting added successfully!');
    }

    public function update(Request $request, $id)
    {
        $request->validate(['value' => 'nullable|string']);

        DB::table('settings')->where('id', $id)->update([
            'value' => $request->value,
            'updated_at' => now()
        ]);

        return redirect()->route('admin.settings.index')->with('success', 'Setting updated successfully!');
    }

    public function destroy($id)
    {
        DB::table('settings')->where('id', $id)->delete();
        return redirect()->route('admin.settings.index')->with('success', 'Setting deleted successfully!');
    }
}
