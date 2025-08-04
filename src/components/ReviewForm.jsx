// import { useState } from 'react';
// import StarRating from './StarRating';

// export default function ReviewForm({ onSubmit }) {
//   const [name, setName] = useState('');
//   const [comment, setComment] = useState('');
//   const [rating, setRating] = useState(5);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!name || !comment) return;
//     onSubmit({
//       id: Date.now(),
//       name,
//       comment,
//       rating,
//       avatar: https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(name)},
//       date: new Date().toLocaleDateString('en-IN', {
//         day: 'numeric',
//         month: 'long',
//         year: 'numeric',
//       }),
//     });
//     setName('');
//     setComment('');
//     setRating(5);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="max-w-md mx-auto my-6 space-y-4">
//       <input
//         type="text"
//         className="w-full px-4 py-2 border rounded-md"
//         placeholder="Your Name"
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//       />
//       <textarea
//         className="w-full px-4 py-2 border rounded-md"
//         placeholder="Your Review"
//         rows="3"
//         value={comment}
//         onChange={(e) => setComment(e.target.value)}
//       />
//       <div className="text-center">
//         <StarRating rating={rating} onChange={setRating} />
//       </div>
//       <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-full">
//         Submit Review
//       </button>
//     </form>
//   );
// }