import { StarsFirst, StarsSecond, StarsThird } from './styles';

/**
 * Custom group of styled components to make a background animation
 * @returns {JSX.Element} element for background animation
 */
export default function Background(): JSX.Element {
  return (
    <>
      <StarsFirst />
      <StarsSecond />
      <StarsThird />
    </>
  );
}
