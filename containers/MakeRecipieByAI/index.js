import axios from 'axios';
import React from 'react';
import Translate from '../../components/Translate/Index';
import Preloader from './Preloader';

export const MakeRecipieByAI = (props) => {
  const [ingredients, setIngredients] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [recipeType, setRecipeType] = React.useState('breakfast');
  const [inputIngredientValue, setInputIngredientValue] = React.useState('');
  const [someDetailInput, setSomeDetailInput] = React.useState('');
  const [aiResult, setAiResult] = React.useState({
    status: 'idle',
    data: null, // chat_gpt_answer_in_html
    error: null
  });
  const [saveStatus, setSaveStatus] = React.useState('idle');
  const imageRef = React.useRef(null);

  const handleNextPage = () => {
    switch (page) {
      case 1:
        if (ingredients.length > 0) {
          setPage((page) => page + 1);
        }
        break;

      case 2:
        setPage((page) => page + 1);
        break;

      case 3:
        if (someDetailInput) {
          setPage((page) => page + 1);
        }
        break;

      default:
        break;
    }
  };

  const handlePrevPage = () => {
    setPage((page) => page - 1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (inputIngredientValue) {
        setIngredients((prev) => [...prev, inputIngredientValue]);
        setInputIngredientValue('');
      }
    }
  };

  const letsGo = () => {
    const loggedUserInfo = props.pageData.loggedInUserDetails;

    if (!loggedUserInfo) {
      window.localStorage.setItem('make-ai-has-request', 1);
    }

    setAiResult((prev) => {
      return {
        ...prev,
        status: 'pending'
      };
    });

    let data = JSON.stringify({
      meal: recipeType,
      ingredients: ingredients,
      cousin: someDetailInput,
      owner: loggedUserInfo ? loggedUserInfo.email : ''
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://64.227.125.101/api/create-recipe/',
      headers: {
        'Content-Type': 'application/json'
      },
      data
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

  const handleSaveRecipe = () => {
    if (saveStatus == 'success') return;
    setSaveStatus('pending');
    let formData = new FormData();
    formData.append('json', JSON.stringify(aiResult.data));

    const image = new Image();

    // Set the source of the image
    image.src = imageRef.current.src;
    image.crossOrigin = 'anonymous';

    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Wait for the image to load
    image.onload = function () {
      // Set the canvas dimensions to match the image
      canvas.width = image.width;
      canvas.height = image.height;

      // Draw the image on the canvas
      ctx.drawImage(image, 0, 0);

      // Convert the canvas image to a Blob
      canvas.toBlob(function (blob) {
        // Create a File object from the Blob
        const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
        formData.append('image', file);
        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: 'https://64.227.125.101/api/save-recipe/',
          headers: {
            'Content-Type': 'application/json'
          },
          data: formData
        };

        axios
          .request(config)
          .then((response) => {
            setSaveStatus('success');
          })
          .catch((error) => {
            setSaveStatus('error');
          });
      }, 'image/jpeg');
    };
  };

  const removeIngredient = (ingredient) => {
    const newIngerients = ingredients.filter((f) => f !== ingredient);
    setIngredients(newIngerients);
  };

  React.useEffect(() => {
    console.log(props, 'PROPS');
  }, []);

  return (
    <div style={{ position: 'relative', padding: '10px 20px' }}>
      {aiResult.status == 'pending' ? <Preloader /> : ''}
      {aiResult.status == 'error' ? (
        <div>
          <h2>Error</h2>
        </div>
      ) : (
        ''
      )}
      {aiResult.status == 'idle' || aiResult.status == 'pending' ? (
        <div>
          <h2 className="create-recipie-heading">
            {Translate(props, 'Create your recipe')}
          </h2>
          <p className="reciepe-step-count">
            {Translate(props, 'Step')} {page}/4
          </p>
          {page == 1 ? (
            <div className="create-recipie-step-root create-recipie-page-1">
              <input
                className="input-ingredient"
                placeholder={Translate(props, 'Enter ingredient and hit enter')}
                value={inputIngredientValue}
                onChange={(e) => setInputIngredientValue(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e)}
              />
              <p className="you-added-ingredients">
                {Translate(props, 'Added ingredients')}:
              </p>
              <div className="added-ingredients-list">
                {ingredients.length
                  ? ingredients.map((ingredient, index) => (
                      <div key={index} className="added-ingredient">
                        {ingredient}
                        <span
                          onClick={() => removeIngredient(ingredient)}
                          class="material-icons"
                          data-icon="close"
                        ></span>
                      </div>
                    ))
                  : ''}
              </div>
            </div>
          ) : (
            ''
          )}
          {page == 2 ? (
            <div className="create-recipie-step-root create-recipie-page-2">
              <h3 className="choose-recipe-type">Choose Recipe type</h3>
              <div className="choose-recipe-type-radio-boxes">
                <div className="choose-recipe-type-radio-item">
                  <input
                    type="radio"
                    name="recipe-type"
                    value="breakfast"
                    checked={recipeType === 'breakfast'}
                    onChange={(e) => setRecipeType(e.target.value)}
                  />
                  <p className="recipe-type-label">Breakfast</p>
                </div>
                <div className="choose-recipe-type-radio-item">
                  <input
                    type="radio"
                    name="recipe-type"
                    value="launch"
                    checked={recipeType === 'launch'}
                    onChange={(e) => setRecipeType(e.target.value)}
                  />
                  <p className="recipe-type-label">Launch</p>
                </div>
                <div className="choose-recipe-type-radio-item">
                  <input
                    type="radio"
                    name="recipe-type"
                    value="dinner"
                    checked={recipeType === 'dinner'}
                    onChange={(e) => setRecipeType(e.target.value)}
                  />
                  <p className="recipe-type-label">Dinner</p>
                </div>
              </div>
            </div>
          ) : (
            ''
          )}
          {page == 3 ? (
            <div className="create-recipie-step-root create-recipie-page-3">
              <p className="recipe-should-be">The recipe should be...</p>
              <input
                className="input-ingredient"
                placeholder={Translate(props, 'Enter')}
                value={someDetailInput}
                onChange={(e) => setSomeDetailInput(e.target.value)}
              />
            </div>
          ) : (
            ''
          )}
          {page == 4 ? (
            <div className="create-recipie-step-root create-recipie-page-4">
              <p
                style={{ fontWeight: 900, color: '#e4c6ff', fontSize: '32px' }}
                className="recipe-should-be"
              >
                Confirm details
              </p>
              <h4 style={{ color: 'white' }}>Ingredients:</h4>
              <div className="added-ingredients-list">
                {ingredients.length
                  ? ingredients.map((ingredient, index) => (
                      <div key={index} className="added-ingredient">
                        {ingredient}
                      </div>
                    ))
                  : ''}
              </div>
              <h4 style={{ color: 'white', marginBottom: '15px' }}>
                Recipe type: {recipeType}
              </h4>
              <h4 style={{ color: 'white', marginBottom: '15px' }}>
                The recipe should be {someDetailInput}
              </h4>
            </div>
          ) : (
            ''
          )}
          <div className="make-recipie-action-buttons">
            {page > 1 ? (
              <button onClick={() => handlePrevPage()}>Back</button>
            ) : (
              ''
            )}
            {page < 4 ? (
              <button onClick={() => handleNextPage()}>Next</button>
            ) : (
              ''
            )}
            {page == 4 ? (
              <button onClick={() => letsGo()}>Ready, Let's Start!</button>
            ) : (
              ''
            )}
          </div>
        </div>
      ) : (
        ''
      )}
      {aiResult.status == 'success' ? (
        <div style={{ position: 'relative' }}>
          {saveStatus == 'pending' ? <Preloader /> : ''}
          <h2 className="create-recipe-result-heading">
            Congratulations! The recipe was created with AI
          </h2>
          <div
            style={{ marginBottom: '40px' }}
            className="create-recipe-result-container"
          >
            <img
              ref={imageRef}
              src={aiResult.data.dall_e_image}
              crossorigin="anonymous"
              style={{ marginBottom: '30px', width: '400px' }}
            />
            <h1>{aiResult.data.gpt_answer['free_text']}</h1>
            <div id="ingredients-section">
              <h2>Ingredients:</h2>
              <p>{aiResult.data.gpt_answer['ingredients']}</p>
            </div>
            <div id="instructions-section">
              <h2>Instructions:</h2>
              <p>
                {aiResult.data.gpt_answer['instructions'].replaceAll(`\n`, '')}
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
            <div onClick={() => handleSaveRecipe()} className="save-recipe-btn">
              Save recipe
            </div>
          </div>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};
