import { userRepository } from '../repositories';

function userService() {
  function get() {
    return userRepository.get();
  }

  return { get };
}

export default userService();
