import React from 'react';
import axios from '../axios-site';
import Layout from '../hoc/Layout/Layout';

import { withTranslation } from 'react-i18next';
import Maintanance from '../containers/Error/Maintenance';
import PageNotFound from '../containers/Error/PageNotFound';
import PermissionError from '../containers/Error/PermissionError';
import Login from '../containers/Login/Index';
import { MyAIRecipes } from '../containers/MyAIRecipes';

const MyRecipes = (props) => (
  <Layout {...props}>
    {props.pagenotfound ? (
      <PageNotFound {...props} />
    ) : props.user_login ? (
      <Login {...props} />
    ) : props.permission_error ? (
      <PermissionError {...props} />
    ) : props.maintanance ? (
      <Maintanance {...props} />
    ) : (
      <div class="container">
        <div style={{ marginTop: '40px' }}>
          <MyAIRecipes {...props} />
        </div>
      </div>
    )}
  </Layout>
);

const Extended = withTranslation('common', {
  wait: typeof window !== 'undefined'
})(MyRecipes);

Extended.getInitialProps = async function (context) {
  console.log(context, 'AAAAA');
  const isServer = !!context.req;
  if (isServer) {
    const req = context.req;
    req.i18n.toJSON = () => null;

    return {
      pageData: context.res.query,
      initialI18nStore: context.res.initialI18nStore,
      i18n: req.i18n,
      initialLanguage: req.i18n.language
    };
  } else {
    let params = '';
    if (context.query) {
      params = '&' + $.param(context.query);
    }
    const pageData = await axios.get('/myrecipes/' + '?data=1' + params);

    return {
      pageData: pageData.data.data,
      user_login: pageData.data.user_login,
      pagenotfound: pageData.data.pagenotfound,
      permission_error: pageData.data.permission_error,
      maintanance: pageData.data.maintanance
    };
  }
};

export default Extended;
