import React from 'react';
import Layout from '../hoc/Layout/Layout';

import axios from '../axios-site';

import { withTranslation } from 'react-i18next';

import Maintanance from '../containers/Error/Maintenance';
import PageNotFound from '../containers/Error/PageNotFound';
import PermissionError from '../containers/Error/PermissionError';
import Login from '../containers/Login/Index';
import { MyAIRecipe } from '../containers/MyAIRecipe';

const Blog = (props) => (
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
          <MyAIRecipe {...props} />
        </div>
      </div>
    )}
  </Layout>
);

const Extended = withTranslation('common', {
  wait: typeof window !== 'undefined'
})(Blog);

Extended.getInitialProps = async function (context) {
  console.log('AAA');
  console.log(context);
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
    const pageData = await axios.get(
      '/myrecipe/' + context.asPath.split('/')[2] + '?data=1'
    );

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
