import axios from 'axios';
import Link from 'next/link';
import React from 'react';

export const MyAIRecipes = (props) => {
  const [aiResult, setAiResult] = React.useState({
    status: 'idle',
    data: null,
    error: null
  });
  const [filterVisibility, setFilerVisibility] = React.useState(false);
  const [levelFilter, setLevelFilter] = React.useState('');
  const [categotyFilter, setCategoryFilter] = React.useState('');
  const [cousinFilter, setCousinFilter] = React.useState('');

  const handleClickFilters = () => {
    setFilerVisibility(!filterVisibility);
  };

  const handleFilter = () => {
    getMyRecipes(true);
  };

  const handleResetFilter = () => {
    setLevelFilter('');
    setCategoryFilter('');
    setCousinFilter('');
    getMyRecipes(false);
  };

  const getMyRecipes = (isFiltered) => {
    const loggedUserInfo = props.pageData.loggedInUserDetails;

    setAiResult((prev) => {
      return {
        ...prev,
        status: 'pending'
      };
    });

    const owner = loggedUserInfo ? loggedUserInfo.email : '';

    const apiUrl = process.env.NODE_ENV === 'production' ? process.env.PRODUCTION_DJANGO_API_URL : process.env.LOCAL_DJANGO_API_URL;

    let config = '';
    if (isFiltered) {
      config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${apiUrl}/api/recipe-filter?owner=${owner}&level=${levelFilter}&category=${categotyFilter}&cousin=${cousinFilter}`,
        headers: {
          'Content-Type': 'application/json'
        }
      };
    } else {
      config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${apiUrl}/api/recipe?owner=${owner}`,
        headers: {
          'Content-Type': 'application/json'
        }
      };
    }

    axios
      .request(config)
      .then((response) => {
        setAiResult(() => {
          return {
            data: response.data,
            status: 'success',
            error: null
          };
        });
      })
      .catch((error) => {
        setAiResult((prev) => {
          return {
            ...prev,
            status: 'error',
            error
          };
        });
      });
  };

  React.useEffect(() => {
    console.log(props, 'PROPS');
    getMyRecipes(false);
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: '40px' }}>My AI Recipes</h2>
      <div className="recipe-filter-cotnainer">
        <div
          onClick={() => handleClickFilters()}
          className="recipes-filter-button"
        >
          <span className="material-icons" data-icon="tune"></span>
          <p>Filter</p>
        </div>
        {filterVisibility ? (
          <div className="recipe-filters-block">
            <div className="recipe-filter-field">
              <p>Level</p>
              <select
                onChange={(e) => setLevelFilter(e.target.value)}
                className="recipe-filter-select"
                value={levelFilter}
              >
                <option value="">Please, choose level</option>
                <option value="intermediate">Intermediate</option>
                <option value="easy">Easy</option>
              </select>
            </div>
            <div className="recipe-filter-field">
              <p>Category</p>
              <select
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="recipe-filter-select"
                value={categotyFilter}
              >
                <option value="">Please, choose category</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Dinner">Dinner</option>
              </select>
            </div>
            <div className="recipe-filter-field">
              <p>Cousin</p>
              <input
                onChange={(e) => setCousinFilter(e.target.value)}
                className="recipe-filter-input"
                value={cousinFilter}
              />
            </div>
            <div className="recipe-filter-action-buttons">
              <div
                onClick={() => handleFilter()}
                className="recipe-filter-searh-btn"
              >
                Search
              </div>
              <p
                onClick={() => handleResetFilter()}
                className="reset-filrers-btn"
              >
                or reset filters
              </p>
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
      <div className="my-recipes-preview-list">
        {aiResult.status == 'idle' || aiResult.status == 'pending' ? (
          <h3>Loading...</h3>
        ) : (
          ''
        )}
        {aiResult.status == 'error' ? <h3>Error</h3> : ''}
        {aiResult.status == 'success' ? (
          aiResult.data.length ? (
            aiResult.data.map((recipe, id) => {
              return (
                <div className="recipe-preview-container" key={id}>
                  <Link href={`/myrecipe`} as={`/myrecipe/${recipe.id}`}>
                    <div className="my-recipe-content">
                      <img src={recipe.dall_e_image} />
                      <h2 style={{ marginBottom: '10px' }}>
                        {recipe.gpt_answer['free_text']}
                      </h2>
                      <p>Ingredients: {recipe.gpt_answer['ingredients']}</p>
                    </div>
                  </Link>
                </div>
              );
            })
          ) : (
            <h3>Empty :(</h3>
          )
        ) : (
          ''
        )}
      </div>
    </div>
  );
};