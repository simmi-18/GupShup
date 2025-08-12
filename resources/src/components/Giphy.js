import React, { useEffect, useState } from "react";
import axios from "axios";

const GiphyToggleSearchbox = ({ apiKey, onSelect, type = "gifs" }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  const fetchTrending = async () => {
    try {
      const endpoint = `https://api.giphy.com/v1/${type}/trending`;
      const res = await axios.get(endpoint, {
        params: {
          api_key: apiKey,
          limit: 25,
        },
      });
      setResults(res.data.data);
    } catch (err) {
      console.error("Error fetching trending:", err);
    }
  };

  const searchGiphy = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return fetchTrending();

    try {
      const endpoint = `https://api.giphy.com/v1/${type}/search`;
      const res = await axios.get(endpoint, {
        params: {
          api_key: apiKey,
          q: searchTerm,
          limit: 25,
        },
      });
      setResults(res.data.data);
    } catch (err) {
      console.error("Error searching Giphy:", err);
    }
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      fetchTrending();
    }
  }, [type, searchTerm]);

  return (
    <div className="w-full">
      {/* Search Input */}
      <form onSubmit={searchGiphy} className="mb-2">
        <input
          type="text"
          placeholder={`Search ${type}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-2 py-1 border rounded text-sm"
        />
      </form>

      {/* Results */}
      <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
        {results.map((item) => (
          <img
            key={item.id}
            src={item.images.fixed_height.url}
            alt={item.title}
            onClick={() => onSelect(item.images.original.url)}
            // onClick={() => onSelect(item.images.fixed_height.url)}
            className="cursor-pointer rounded hover:scale-105 transition"
          />
        ))}
      </div>
    </div>
  );
};

export default GiphyToggleSearchbox;
