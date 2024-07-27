import { useEffect, useState } from "react";
import JobPosting from "./components/JobPosting";
import "./App.css";

const ITEMS_PER_PAGE = 6;
const API_ENDPOINT = "https://hacker-news.firebaseio.com/v0";

// Predefined categories (you can also fetch these from an API or a separate file)
const CATEGORIES = ["All", "Software", "Design", "Data", "Marketing"];

export default function JobApp() {
  const [items, setItems] = useState([]);
  const [itemIds, setItemIds] = useState(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");

  async function fetchItems(page) {
    setFetchingDetails(true);

    let itemsList = itemIds;
    if (itemsList === null) {
      const response = await fetch(`${API_ENDPOINT}/jobstories.json`);
      itemsList = await response.json();
      setItemIds(itemsList);
      setTotalPages(Math.ceil(itemsList.length / ITEMS_PER_PAGE));
    }

    let filteredItems = itemsList;

    // Apply category filtering (assuming job stories have category info, adjust as necessary)
    if (selectedCategory !== "All") {
      filteredItems = itemsList.filter(itemId => {
        // Fetch each item's details to check category (if needed)
        return fetch(`${API_ENDPOINT}/item/${itemId}.json`)
          .then(response => response.json())
          .then(item => item.category === selectedCategory);
      });
    }

    const itemIdsForPage = filteredItems.slice(
      page * ITEMS_PER_PAGE,
      page * ITEMS_PER_PAGE + ITEMS_PER_PAGE
    );

    const itemsForPage = await Promise.all(
      itemIdsForPage.map((itemId) =>
        fetch(`${API_ENDPOINT}/item/${itemId}.json`).then((response) =>
          response.json()
        )
      )
    );
    setItems(itemsForPage);
    setTotalPages(Math.ceil(filteredItems.length / ITEMS_PER_PAGE));

    setFetchingDetails(false);
  }

  useEffect(() => {
    fetchItems(currentPage);
  }, [currentPage, selectedCategory]);

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i);

  return (
    <div className="custom-app">
      <nav className="navbar">
        <h1 className="navbar-title">JobBoard Explorer</h1>
        <button
          className="navbar-button"
          onClick={() => setCurrentPage(0)}
        >
          Home
        </button>
      </nav>
      <div className="filters">
        <label htmlFor="category-select">Category:</label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(0); // Reset to first page on category change
          }}
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="content">
        {fetchingDetails ? (
          <p className="custom-loading">Loading...</p>
        ) : (
          <div>
            <div className="custom-items" role="list">
              {items.map((item) => (
                <JobPosting key={item.id} {...item} />
              ))}
            </div>
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                Previous
              </button>
              {pageNumbers.map((number) => (
                <button
                  key={number}
                  className={`pagination-button ${number === currentPage ? 'active' : ''}`}
                  onClick={() => handlePageChange(number)}
                >
                  {number + 1}
                </button>
              ))}
              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
