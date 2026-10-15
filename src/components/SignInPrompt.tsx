import { useAuth } from '../auth/context'
import { AuthDialog } from './AuthDialog'

/**
 * Mounts the sign-in dialog once, above the router, so any component can open
 * it with `promptSignIn()` without threading props or remounting the editor.
 */
export function SignInPrompt() {
  const { signInPromptOpen, closeSignInPrompt } = useAuth()
  return <AuthDialog open={signInPromptOpen} onClose={closeSignInPrompt} />
}
