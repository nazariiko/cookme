import axios from 'axios';
import React from 'react';

export const MyAIRecipe = (props) => {
  const [aiResult, setAiResult] = React.useState({
    status: 'idle',
    data: null,
    error: null
  });

  const getMyRecipes = () => {
    const loggedUserInfo = props.pageData.loggedInUserDetails;

    setAiResult((prev) => {
      return {
        ...prev,
        status: 'pending'
      };
    });

    const id = props.currentPageUrl
      ? props.currentPageUrl.split('/')[2]
      : props.pageData.id;

    const owner = loggedUserInfo ? loggedUserInfo.email : '';

    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://64.227.125.101/api/recipe/${id}?owner=${owner}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

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
    getMyRecipes();
  }, []);

  return (
    <div>
      <div className="my-recipes-preview-list">
        {aiResult.status == 'idle' || aiResult.status == 'pending' ? (
          <h3>Loading...</h3>
        ) : (
          ''
        )}
        {aiResult.status == 'error' ? <h3>Error</h3> : ''}
        {aiResult.status == 'success' ? (
          <div className="recipe-full-container">
            <div className="my-recipe-img-comtainer">
              <img src={aiResult.data.dall_e_image} />
            </div>
            <div className="my-recipe-full-content-container">
              <h1>{aiResult.data.gpt_answer['free_text']}</h1>
              <div id="ingredients-section">
                <h2>Ingredients:</h2>
                <p>{aiResult.data.gpt_answer['ingredients']}</p>
              </div>
              <div id="instructions-section">
                <h2>Instructions:</h2>
                <p>
                  {aiResult.data.gpt_answer['instructions'].replaceAll(
                    `\n`,
                    ''
                  )}
                </p>
              </div>
              <div id="serving-section">
                <h2>Serving Recommendation:</h2>
                <p>{aiResult.data.gpt_answer['serving_recommendation']}</p>
              </div>
              <div class="d-flex flex-wrap" id="flex-section">
                <div class="card m-2" style={{ width: '18rem' }}>
                  <div class="card-body">
                    <h3 class="card-title">Level</h3>
                    <p class="card-text">{aiResult.data.gpt_answer['level']}</p>
                  </div>
                </div>
                <div class="card m-2" style={{ width: '18rem' }}>
                  <div class="card-body">
                    <h3 class="card-title">Preparation Time</h3>
                    <p class="card-text">
                      {aiResult.data.gpt_answer['preparation_time']}
                    </p>
                  </div>
                </div>
                <div class="card m-2" style={{ width: '18rem' }}>
                  <div class="card-body">
                    <h3 class="card-title">Total Time</h3>
                    <p class="card-text">
                      {aiResult.data.gpt_answer['total_time']}
                    </p>
                  </div>
                </div>
                <div class="card m-2" style={{ width: '18rem' }}>
                  <div class="card-body">
                    <h3 class="card-title">Category</h3>
                    <p class="card-text">
                      {aiResult.data.gpt_answer['category']}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
    </div>
  );
};
