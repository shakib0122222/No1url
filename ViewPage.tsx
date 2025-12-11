import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { LinkData } from '../types';

const ViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [count, setCount] = useState(5);
  const [ready, setReady] = useState(false);
  
  // Track clicks for the "Get Link" trap logic
  // 0 = Initial state
  // 1 = Clicked once (went to ads), returned
  // 2 = Clicked again (goes to content)
  const [clickStep, setClickStep] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const docRef = doc(db, 'links', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setData(docSnap.data() as LinkData);
          
          // Increment global visitors
          const statsRef = doc(db, 'stats', 'global');
          updateDoc(statsRef, { total: increment(1) }).catch(err => console.log("Stats error", err));

          // Check session storage to see if user returned from ad
          const hasClickedAd = sessionStorage.getItem(`pixguard_clicked_${id}`);
          if (hasClickedAd) {
            setClickStep(1);
          }

        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    let timer: any;
    if (showCountdown && count > 0) {
      timer = setTimeout(() => setCount(count - 1), 1000);
    } else if (showCountdown && count === 0) {
      setReady(true);
    }
    return () => clearTimeout(timer);
  }, [showCountdown, count]);

  const handleFakeDownload = () => {
    if (data?.adsUrl) {
      window.location.href = data.adsUrl;
    }
  };

  const startCountdownProcess = () => {
    setShowCountdown(true);
    // Scroll to bottom to see the countdown area clearly
    setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleGetLink = () => {
    if (!data) return;

    if (clickStep === 0) {
      // First click: Go to Ads URL
      sessionStorage.setItem(`pixguard_clicked_${id}`, 'true');
      setClickStep(1);
      window.location.href = data.adsUrl;
    } else {
      // Second click (after back): Go to Content URL
      // Clear session so next time they visit fresh it resets (optional, but good for UX)
      sessionStorage.removeItem(`pixguard_clicked_${id}`);
      window.location.href = data.contentUrl;
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-xl font-bold">Loading...</div>;
  if (!data) return <div className="flex h-screen items-center justify-center text-xl text-red-500">Link not found or expired.</div>;

  if (showCountdown) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Please Wait...</h2>
          
          <div className="text-6xl font-black text-blue-600 mb-6">
            {count}
          </div>

          {ready && (
            <div className="animate-fade-in-up">
              <p className="text-lg text-green-600 font-bold mb-4">Your Link almost ready</p>
              <button
                onClick={handleGetLink}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-xl shadow-lg transform active:scale-95 transition-all"
              >
                Get Link
              </button>
              <p className="mt-4 text-sm text-gray-500">
                {clickStep === 0 ? "Click above to unlock content" : "Link unlocked! Click again."}
              </p>
            </div>
          )}
          
          {!ready && (
             <p className="text-gray-400">Preparing destination...</p>
          )}
        </div>
        
        {/* Adsterra Banner Placeholder in Countdown */}
        <div className="mt-8 w-full max-w-md h-20 bg-gray-200 flex items-center justify-center rounded border border-gray-300 text-gray-500 text-sm">
             Adsterra Banner Space (Add Script Here)
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl overflow-hidden">
        
        {/* Top Image */}
        <div className="w-full aspect-video bg-gray-100 relative">
          <img 
            src={data.imageUrl} 
            alt="Content Preview" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-5 space-y-6">
          
          {/* Row 1 Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleFakeDownload}
              className="bg-red-600 text-white font-bold py-3 rounded shadow hover:bg-red-700 transition"
            >
              Watch Now
            </button>
            <button 
              onClick={handleFakeDownload}
              className="bg-green-600 text-white font-bold py-3 rounded shadow hover:bg-green-700 transition"
            >
              Download
            </button>
          </div>

          {/* Row 2 Buttons (Option 2) */}
          <div className="grid grid-cols-2 gap-4">
             <button 
              onClick={handleFakeDownload}
              className="bg-indigo-600 text-white font-bold py-3 rounded shadow hover:bg-indigo-700 transition"
            >
              Stream HD
            </button>
            <button 
              onClick={handleFakeDownload}
              className="bg-orange-500 text-white font-bold py-3 rounded shadow hover:bg-orange-600 transition"
            >
              Fast Server
            </button>
          </div>

          {/* Adsterra Banner Placeholder */}
          <div className="w-full h-32 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 font-medium">
            Adsterra Banner Code Here
          </div>

          {/* Instructions Box (Bengali) */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded text-sm text-gray-800 space-y-1">
            <h3 className="font-bold text-lg mb-2 text-yellow-800">কিভাবে ভিডিও ডাউনলোড করবেন</h3>
            <p>1. “Continue” বাটনে ক্লিক করুন।</p>
            <p>2. এড এ রিডাইরেক্ট করলে Back করুন।</p>
            <p>3. ৫–৮ সেকেন্ড অপেক্ষা করুন।</p>
            <p>4. “Get Link” আসলে ক্লিক দিন।</p>
            <p>5. আবার Back করে Get Link চাপুন।</p>
            <p className="font-semibold text-red-500 mt-2">নোট: ভুল পেজ এ নিলে ব্যাক করুন।</p>
          </div>

          {/* Continue Button */}
          <div className="pt-4 pb-8">
            <button
              onClick={startCountdownProcess}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xl py-4 rounded-lg shadow-lg animate-pulse"
            >
              Click Here to Continue
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ViewPage;