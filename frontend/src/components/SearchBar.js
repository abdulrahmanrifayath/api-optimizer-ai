import "../styles/SearchBar.css";

function SearchBar({ value, onChange }) {

    return (

        <div className="search-container">

            <input
                type="text"
                placeholder="🔍 Search endpoints, recommendations, actions..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="search-input"
            />

        </div>

    );

}

export default SearchBar;