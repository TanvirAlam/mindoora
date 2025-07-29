import { useEffect, useState } from "react";
import { AboutUsModalWrapper } from "~/styles/mixins.styled";
import { Styled } from "./TermsAndConditions.styled";
import Image from "next/image";
import { apiSetup } from "~/utils/api/api";
import { endPoints } from "~/utils/api/route";
import { modalRecoilState } from "~/ui/components/utils/atoms/ModalState";
import { useRecoilState } from "recoil";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

export const TermsAndConditions = ({ checkTCAccepted, setRecheck }: any) => {
  const router = useRouter();
  const [, setModalState] = useRecoilState(modalRecoilState);
  const [metadata, setMetadata] = useState<any>({
    tarmsAndConditions: false,
    specialOffers: false,
  });
  const [disableButton, setDisableButton] = useState(true);

  useEffect(() => {
    checkTCAccepted();
  }, []);

  const handleCancel = (e: any) => {
    e.preventDefault();
    setRecheck(false);
    setTimeout(() => {
      router.push("/");
      signOut();
      setModalState({
        open: false,
        modalComponent: <></>,
      })
    }, 1000)
  };

  const handleConfirm = async (e: any) => {
    e.preventDefault();
    if (!metadata.tarmsAndConditions) {
      toast.error("You must accept the Terms & Conditions to proceed");
      return;
    }

    const api = await apiSetup();
    api
      .post(endPoints.acceptTC.save, { metadata })
      .then((response: any) => {
        if (response.status === 201) {
          setModalState({
            open: false,
            modalComponent: <></>,
          });
        }
      })
      .catch((error: any) => {
        console.log(error);
      });
    checkTCAccepted();
  };

  return (
    <AboutUsModalWrapper>
      <Styled.TermsAndConditionsWrapper>
        <div className="row">
          <div className="col-xs-12 col-sm-8 col-sm-offset-2">
            <div className="titles flex flex-col items-center justify-center">
              <Image
                src="/assets/mindoora.png"
                alt="mindoora-logo"
                width={250}
                height={20}
              />
              <h1 className="title">Terms & Conditions</h1>
              <h2 className="subtitle">
                To create an account with Mindoora, please read and agree to our
                Terms & Conditions and Privacy Notice
              </h2>
            </div>

            <div className="legal">
              <div className="legal__instructions">
                <div className="alert alert-info" role="alert">
                  <strong>
                    <i className="fa fa-exclamation-triangle"></i>
                    Important.
                  </strong>
                  <span>
                    In order to continue, you must read the Terms & Conditions
                    and Privacy Notice by scrolling to the bottom.
                  </span>
                </div>
              </div>
              <nav className="legal__navigation">
                <span>Navigate to:</span>
                <ol>
                  <li>
                    <a className="terms-nav" href="#terms-and-conditions">
                      Terms & Conditions
                    </a>
                  </li>
                  <li>
                    <a className="terms-nav" href="#privacy-notice">
                      Privacy Policy
                    </a>
                  </li>
                </ol>
                <div className="legal__progress"></div>
              </nav>
              <div className="legal__terms">
                <div className="legal__terms-scroll">
                  <div id="terms-and-conditions">
                    <strong>Terms and Conditions</strong>
                    <p>
                      Welcome to Mindoora, an online social quiz game where
                      users can enjoy playing quiz games for fun and educational
                      purposes. By accessing or using Mindoora, you agree to be
                      bound by the following terms and conditions:
                    </p>
                    <p>
                      Acceptance of Terms: By accessing or using Mindoora, you
                      acknowledge that you have read, understood, and agree to
                      be bound by these terms and conditions. If you do not
                      agree to these terms, please refrain from accessing or
                      using Mindoora.
                    </p>
                    <p>
                      User Conduct: You agree to use Mindoora only for lawful
                      purposes and in a manner consistent with all applicable
                      laws and regulations. You shall not engage in any activity
                      that disrupts the normal functioning of Mindoora or
                      interferes with the enjoyment of other users.
                    </p>
                    <p>
                      Account Registration: To access certain features of
                      Mindoora, you may be required to create an account. You
                      agree to provide accurate and complete information during
                      the registration process and to keep your account
                      credentials confidential. You are solely responsible for
                      any activity that occurs under your account.
                    </p>
                    <p>
                      User-Generated Content: Mindoora may allow users to create
                      their own quiz games and generate questions. By submitting
                      content to Mindoora, you grant us a worldwide,
                      non-exclusive, royalty-free license to use, reproduce,
                      modify, adapt, publish, translate, distribute, and display
                      such content.
                    </p>
                    <p>
                      Intellectual Property: All content and materials available
                      on Mindoora, including but not limited to text, graphics,
                      logos, images, and software, are the property of Mindoora
                      or its licensors and are protected by copyright,
                      trademark, and other intellectual property laws.
                    </p>
                    <p>
                      Disclaimer of Warranties: Mindoora is provided on an "as
                      is" and "as available" basis, without any warranties of
                      any kind, either express or implied. We do not guarantee
                      that Mindoora will be uninterrupted or error-free, or that
                      any defects will be corrected.
                    </p>
                    <p>
                      Limitation of Liability: In no event shall Mindoora or its
                      affiliates be liable for any indirect, incidental,
                      special, consequential, or punitive damages arising out of
                      or in connection with your use of Mindoora, whether based
                      on warranty, contract, tort (including negligence), or any
                      other legal theory.
                    </p>
                    <p>
                      Modification of Terms: We reserve the right to modify
                      these terms and conditions at any time, without prior
                      notice. Any changes will be effective immediately upon
                      posting on Mindoora. Your continued use of Mindoora after
                      such modifications constitutes your acceptance of the
                      revised terms.
                    </p>
                    <p>
                      Termination: We reserve the right to suspend or terminate
                      your access to Mindoora at any time, without prior notice,
                      for any reason or no reason, including but not limited to
                      violation of these terms and conditions.
                    </p>
                    <p>
                      Governing Law: These terms and conditions shall be
                      governed by and construed in accordance with the laws of
                      [insert jurisdiction]. Any disputes arising out of or in
                      connection with these terms shall be resolved exclusively
                      by the courts of [insert jurisdiction].
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="legal__rules"
                aria-expanded="false"
                aria-hidden="true"
              >
                <div className="legal__rule">
                  <div className="toggle--checkbox">
                    <label className="toggle__agree">
                      <input
                        type="checkbox"
                        className="checkbox"
                        onChange={(e) =>
                          setMetadata((prev) => ({
                            ...prev,
                            tarmsAndConditions: e.target.checked,
                          }))
                        }
                      />
                      <span className="control-indicator"></span>
                      <span className="toggle__button">
                        I agree to the above terms and conditions{" "}
                        <i className="fa fa-external-link"></i>
                        and privacy policy{" "}
                        <i className="fa fa-external-link"></i>
                        <sup>1</sup>
                      </span>
                    </label>
                  </div>
                </div>
                <div className="legal__rule">
                  <div className="toggle--checkbox">
                    <label className="toggle__agree">
                      <input
                        type="checkbox"
                        className="checkbox"
                        onChange={(e) =>
                          setMetadata((prev) => ({
                            ...prev,
                            specialOffers: e.target.checked,
                          }))
                        }
                      />
                      <span className="control-indicator"></span>
                      <span className="toggle__button">
                        I would like to be informed about special offers, such
                        as events in my area etc.<sup>2</sup>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="legal__actions">
                <div>
                  <button
                    type="button"
                    onClick={(e) => {
                      handleConfirm(e);
                    }}
                    className="disable
                                mb-2
                                me-2
                                rounded-lg
                                bg-green-700
                                px-5
                                py-2.5
                                text-sm
                                font-medium
                                text-white
                                hover:bg-green-800
                                focus:outline-none
                                focus:ring-4
                                focus:ring-green-300
                                disabled:cursor-not-allowed
                                disabled:bg-gray-900
                                disabled:hover:bg-gray-900
                                dark:bg-green-600
                                dark:hover:bg-green-700
                                dark:focus:ring-green-800"
                    disabled={!disableButton}
                  >
                    Accept & Continue
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleCancel(e)}
                    className="mb-2 me-2 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                  >
                    Cancel
                  </button>
                </div>
                <div>
                  <div>
                    <sup>1</sup> Must agree to create your account
                  </div>
                  <div>
                    <sup>2</sup> Must agree or disagree to create your account
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Styled.TermsAndConditionsWrapper>
    </AboutUsModalWrapper>
  );
};
