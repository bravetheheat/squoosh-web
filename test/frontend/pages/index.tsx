import type { NextPage } from 'next';
import Head from 'next/head';
import ExampleImageBox from '../components/ImageBox/ExampleImageBox';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Create Next App</title>
      </Head>
      <div className='h-screen w-screen max-h-screen'>
        <ExampleImageBox />
      </div>
    </div>
  );
};

export default Home;
