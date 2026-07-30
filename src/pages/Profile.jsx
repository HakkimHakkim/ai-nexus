import Sidebar from '../components/Sidebar.jsx'
import AmbientBackground from '../components/AmbientBackground.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useEffect, useState } from 'react'

const activity = [
  { title: 'Updated profile picture', sub: '2 hours ago' },
  { title: 'Started React Refactoring', sub: 'Yesterday, 4:12 PM' },
  { title: 'Compared Gemini vs Llama', sub: 'Oct 24, 2023' },
]

export default function Profile() {
  const [profilePhoto, setProfilePhoto] = useState("");
  const { user } = useAuth()
  const [profile, setProfile] = useState(null);
  const [userImage, setUserImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);


  const [form, setForm] = useState({
  name: "",
  phone: "",
  country: "",
  occupation: "",
  website: "",
  bio: "",
});

const stats = [
  { label: "Total Chats", value: profile?.total_chats ?? 0 },
  { label: "Comparisons", value: 0 },
  { label: "Saved Items", value: 0 },
  { label: "Join Date", value: profile?.join_date ?? "-" },
];

useEffect(() => {
  async function loadProfile() {
    try {
      const token = localStorage.getItem("ai-nexus-token");

      const res = await fetch("https://ai-nexus-backend-wato.onrender.com/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

        const data = await res.json();

if (res.ok) {
  setProfile(data);
  setUserImage(data.profile_photo);
}
setForm({
  name: data.name || "",
  phone: data.phone || "",
  country: data.country || "",
  occupation: data.occupation || "",
  website: data.website || "",
  bio: data.bio || "",
});
      } catch (err) {
        console.error(err);
      }
    }

  loadProfile();
  async function saveProfile() {
  try {
    const token = localStorage.getItem("ai-nexus-token");

    const res = await fetch("https://ai-nexus-backend-wato.onrender.com/api/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Profile updated successfully!");
      setProfile({ ...profile, ...form });
    } else {
      alert(data.detail || "Update failed");
    }
  } catch (err) {
    console.error(err);
    alert("Server Error");
  }
}
}, []);
async function saveProfile() {
  try {
    const token = localStorage.getItem("ai-nexus-token");

    const res = await fetch("https://ai-nexus-backend-wato.onrender.com/api/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
 

    const data = await res.json();

    alert(data.message);

    setProfile({
      ...profile,
      ...form,
    });

  } catch (err) {
    console.error(err);
  }
}

const uploadPhoto = async () => {
  console.log("selectedFile =", selectedFile);
  if (!selectedFile) {
    alert("Click ok to change the photo (Then click upload).");
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    const token = localStorage.getItem("ai-nexus-token");

    const response = await fetch(
      "https://ai-nexus-backend-wato.onrender.com/api/me/upload-photo",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

 const data = await response.json();

console.log("Upload Response =", data);

if (data.url) {
  setProfilePhoto(
    `https://ai-nexus-backend-wato.onrender.com${data.url}`
  );
  setUserImage(data.url);
}

    alert("Profile photo uploaded!");

  } catch (error) {
    console.error("Upload failed:", error);
  }
};
  return (
    <div className="flex min-h-screen text-body">
      <AmbientBackground />
      <Sidebar />
      <main className="flex-1 px-10 py-8">
        <h1 className="mb-6 text-xl font-bold text-heading">Profile</h1>

        <div className="glass rounded-2xl p-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
  {profilePhoto || userImage ? (
<div>
  <img
    src={
      profilePhoto ||
      `http://127.0.0.1:8000${userImage}`
    }
    alt="Profile"
    style={{
      width: "150px",
      height: "150px",
      borderRadius: "50%",
      objectFit: "cover"
    }}
  />
</div>
) : (
<div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-fuchsia-500" />
)}
              <div>
                <p className="text-lg font-semibold text-heading">{user?.name || 'Guest'}</p>
                <p className="text-sm text-muted">{user?.email || '-'}</p>
              </div>
            </div>
<input
  id="photoUpload"
  type="file"
  hidden
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    uploadPhoto(file);
  }}
/>

<label htmlFor="photoUpload" className="btn-primary cursor-pointer">
  Change profile
</label>

<button
  type="button"
  onClick={uploadPhoto}
  className="btn-primary"
>
  Upload
</button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border surface p-4 text-center">
                <p className="text-lg font-bold text-heading">{s.value}</p>
                <p className="text-xs text-faint">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="glass rounded-2xl p-6 lg:col-span-2">
            <p className="mb-4 text-sm font-semibold text-body">Personal Information</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
              <div><p className="text-xs text-faint">Full Name</p>

<input
  type="text"
  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
  value={form.name}
  onChange={(e) => setForm({ ...form, name: e.target.value })}
/></div>
              <div><p className="text-xs text-faint">Email Address</p><p className="text-body">
  {profile?.email || "Loading..."}
</p></div>
              <div><p className="text-xs text-faint">Phone Number</p>

<input
  type="text"
  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
  value={form.phone}
  onChange={(e) => setForm({ ...form, phone: e.target.value })}
/></div>
    <div>
  <p className="text-xs text-faint">Country</p>

  <input
    type="text"
    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
    value={form.country}
    onChange={(e) => setForm({ ...form, country: e.target.value })}
  />
</div>
           <div>
  <p className="text-xs text-faint">Occupation</p>

  <input
    type="text"
    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
    value={form.occupation}
    onChange={(e) => setForm({ ...form, occupation: e.target.value })}
  />
</div>
      <div>
  <p className="text-xs text-faint">Country</p>

  <input
    type="text"
    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
    value={form.country}
    onChange={(e) => setForm({ ...form, country: e.target.value })}
  />
</div>
            </div>
            <div className="mt-4">
  <p className="text-xs text-faint">Bio</p>
 <textarea
  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
  rows="4"
  value={form.bio}
  onChange={(e) => setForm({ ...form, bio: e.target.value })}
/>
</div>
   <button
  className="btn-primary mt-4"
  onClick={saveProfile}
>
  Save Changes
</button>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-2xl p-6">
              <p className="mb-3 text-sm font-semibold text-body">AI Preferences</p>
              <div className="space-y-2 text-sm">
                <div><p className="text-xs text-faint">Favorite AI Models</p><p className="text-body">Gemini, GPT-4</p></div>
                <div><p className="text-xs text-faint">Default Workspace</p><p className="text-body">Personal Sandbox</p></div>
                <div><p className="text-xs text-faint">Preferred Language</p><p className="text-body">English (US)</p></div>
                <div><p className="text-xs text-faint">Default Prompt Style</p><p className="text-body">Concise &amp; Direct</p></div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <p className="mb-3 text-sm font-semibold text-body">Recent Activity</p>
              <div className="space-y-2">
                {activity.map((a) => (
                  <div key={a.title}>
                    <p className="text-sm text-body">{a.title}</p>
                    <p className="text-xs text-faint">{a.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
