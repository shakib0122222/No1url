import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, onSnapshot, updateDoc, increment, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';
import { nanoid } from 'nanoid';

const Home: React.FC = () => {
  const [contentUrl, setContentUrl] = useState('');
  const [adsUrl, setAdsUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [totalVisitors, setTotalVisitors] = useState<number>(0);

  useEffect(() => {
    // Listen to real-time visitor stats
    const statsRef = doc(db, 'stats', 'global');
    const unsubscribe = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        setTotalVisitors(docSnap.data().total || 0);
      } else {
        // Initialize if not exists
        setDoc(statsRef, { total: 0 });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentUrl || !adsUrl || !imageFile) {
      alert('সব তথ্য পূরণ করুন (Please fill all fields)');
      return;
    }

    setLoading(true);
    try {
      // Upload Image
      const imageRef = ref(storage, `images/${nanoid()}_${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(imageRef);

      // Create Link ID
      const linkId = nanoid(8);

      // Save to Firestore
      await setDoc(doc(db, 'links', linkId), {
        id: linkId,
        contentUrl,
        adsUrl,
        imageUrl,
        createdAt: Date.now(),
      });

      // Generate full URL
      const fullUrl = `${window.location.origin}${window.location.pathname}#/v/${linkId}`;
      setGeneratedLink(fullUrl);

    } catch (error) {
      console.error("Error creating link:", error);
      alert("Error creating link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    alert('Link Copied!');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="bg-blue-600 text-white p-6 text-center shadow-md">
        <h1 className="text-3xl font-bold mb-2">Pixguard URLশর্টনার</h1>
        <p className="text-blue-100 text-lg">Shorten Your long Url easily here</p>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 max-w-lg">
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Content URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content Link</label>
              <input
                type="url"
                placeholder="https://your-content.com/video"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              />
            </div>

            {/* Ads URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ads Link (Redirect)</label>
              <input
                type="url"
                placeholder="https://ads-network.com/..."
                value={adsUrl}
                onChange={(e) => setAdsUrl(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" required />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  {imageFile && <p className="text-sm text-green-600 font-semibold">{imageFile.name}</p>}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-bold text-lg shadow-md transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'}`}
            >
              {loading ? 'Processing...' : 'Generate Link'}
            </button>
          </form>

          {/* Result Area */}
          {generatedLink && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium mb-2">Your Shortened Link:</p>
              <div className="flex items-center gap-2">
                <input 
                  readOnly 
                  value={generatedLink} 
                  className="flex-1 p-2 border border-gray-300 rounded text-sm bg-white"
                />
                <button 
                  onClick={copyToClipboard}
                  className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm font-medium"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-white px-6 py-3 rounded-full shadow border border-gray-200">
            <span className="text-gray-500 font-medium">Realtime Total Visitors: </span>
            <span className="text-blue-600 font-bold text-xl">{totalVisitors.toLocaleString()}</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-6 text-center">
        <p className="text-lg font-semibold text-white">Pixguard</p>
        <p className="text-sm mt-1">&copy; {new Date().getFullYear()} All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;