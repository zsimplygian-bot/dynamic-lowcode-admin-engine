<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Traits\HasDynamicFileUpload;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    use HasDynamicFileUpload;

    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();

        // 1. Manejar eliminación del avatar
        if ($request->boolean('_remove_avatar')) {
            $oldAvatar = $user->getRawOriginal('avatar');
            if (!empty($oldAvatar)) {
                $this->deleteFileAndThumb($oldAvatar);
            }
            $data['avatar'] = null;
        }

        // 2. Procesar la subida si se adjuntó una nueva imagen
        if ($request->hasFile('avatar') && $request->file('avatar')->isValid()) {
            $oldAvatar = $user->getRawOriginal('avatar');
            $savedPath = $this->processAndStoreFile($request->file('avatar'), 'avatars', $oldAvatar);
            $data['avatar'] = Storage::url($savedPath);
        }

        $user->fill($data);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        return to_route('profile.edit');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        $oldAvatar = $user->getRawOriginal('avatar');
        if (!empty($oldAvatar)) {
            $this->deleteFileAndThumb($oldAvatar);
        }

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}