<?php
namespace App\Http\Controllers\Settings;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\{ProfileDeleteRequest, ProfileUpdateRequest};
use App\Traits\{HasDynamicFileUpload, HasNotify};
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
class ProfileController extends Controller
{
    use HasDynamicFileUpload, HasNotify;
    public function show(Request $request)
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status'          => $request->session()->get('status'),
        ]);
    }
    public function update(ProfileUpdateRequest $request)
    {
        $user = $request->user();
        $user->fill($this->handleFilesUpload($request, 'avatars', $request->validated(), $user));
        if ($user->isDirty('email')) $user->email_verified_at = null;
        $user->save();
        return $this->notify('Profile updated.');
    }
    public function destroy(ProfileDeleteRequest $request)
    {
        $user = $request->user();
        $this->deleteRecordFiles($user);
        Auth::logout();
        $user->delete();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }
}