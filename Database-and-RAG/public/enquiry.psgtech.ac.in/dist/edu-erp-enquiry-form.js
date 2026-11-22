/*! edu-erp-enquiry-form 2026-06-07 */
(function init() {
    //Add below line at the top of your JavaScript code
    Dropzone.autoDiscover = false;
    //This will prevent Dropzone to instantiate on it's own unless you are using dropzone class for styling

})();
(function () {
    'use strict';
    var App = angular.module('ies', [
        'ui.router',
        'ui.router.state.events',
        'ghiscoding.validation',
        'pascalprecht.translate',
        'ui.materialize',
        'AngularPrint',
        'oc.lazyLoad',
        'ngPassword',
        'ngSanitize',
        'thatisuday.dropzone',
        'angular-flatpickr',
        'ngIdle',
        'zingchart-angularjs',
        'ui.tinymce',
        angularDragula(angular)
    ]);
    App.config(['$translateProvider', 'IdleProvider', 'KeepaliveProvider', function ($translateProvider, IdleProvider, KeepaliveProvider) {
        $translateProvider.useStaticFilesLoader({
            prefix: 'assets/validation/',
            suffix: '.json'
        });

        // load English ('en') table on startup
        $translateProvider.preferredLanguage('en').fallbackLanguage('en');
        $translateProvider.useSanitizeValueStrategy('escapeParameters');

        IdleProvider.idle(5 * 60);
        IdleProvider.timeout(1);
        KeepaliveProvider.interval(10);
    }]);

    App.run(['$rootScope', '$translate', '$interval', function ($rootScope, $translate, $interval) {
        if ($translate.use()) {
            $translate.refresh();
        } else {
            var token = $interval(function () {
                if (!$translate.use()) return;
                $translate.refresh();
                $interval.cancel(token);
            }, 10);
        }
    }]);

    App.config(configuration);
    configuration.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider', '$sceDelegateProvider'];

    function configuration($stateProvider, $urlRouterProvider, $locationProvider, $sceDelegateProvider) {
        $locationProvider.html5Mode(false);
        var resolveObj = {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load({
                    insertBefore: '#css-bootstrap',
                    serie: true,
                    files: [
                        'bower_components/angular-ui-select/dist/select.min.css',
                        'bower_components/angular-ui-select/dist/select.min.js',
                    ]
                });
            }]
        };

        $urlRouterProvider.otherwise('enquiry/login');
        $stateProvider
            .state('ies', {
                url: "/",
                abstract: true,
                template: '<ui-view/>'
            })
            .state('ies.enquiry', {
                url: "",
                abstract: true,
                template: '<ui-view/>'
            })
            .state('ies.enquiry.login', {
                url: 'enquiry/login',
                template: '<div login></div>',
            })
            .state('ies.enquiry.status', {
                url: 'enquiry/status',
                template: '<div enquiry-status></div>',
            })
            .state('ies.enquiry.preview', {
                url: 'enquiry/data/preview',
                template: '<div preview-form></div>'
            })
            .state('ies.enquiry.formPrint', {
                url: 'enquiry/formPrint',
                template: '<div form-print></div>',
            })
            .state('ies.enquiry.form', {
                url: 'enquiry/form',
                template: '<div enquiry-form></div>',
                resolve: resolveObj
            })
            .state('ies.enquiry.markEntry', {
                url: 'enquiry/markEntry',
                template: '<div enquiry-form></div>',
                resolve: resolveObj
            })
    }

    App.run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            if ($rootScope.currentApplicant) {
                if ($rootScope.currentApplicant.status == "SD" && !($rootScope.markEntryMode || $rootScope.isNeedsCorrection || $rootScope.editPreferenceMode) && toState.name == 'ies.enquiry.form') {
                    event.preventDefault();
                    $state.go('ies.enquiry.status');
                }
            }
        });
    }]);

})();
;
(function () {
    'use strict';

    var relativeRoot = "";

    function getFullUrl(url) {
        if (relativeRoot.length == 0) {
            return url;
        }

        return relativeRoot + url;
    }

    angular.module('ies').service('signupService', signupService)
    signupService.$inject = ['$http'];

    function signupService($http) {
        this.isClosed = function (callback) {
            var request = {
                url: getFullUrl('/signup/is/portal/closed/'),
                method: 'GET',
                timeout: 2 * 60 * 1000,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            $http(request).then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error, null);
            });
        }
        this.generateOtp = function (signup, contactNo, callback) {
            var request = {
                url: getFullUrl('/signup/send/mobile/otp/') + contactNo,
                data: JSON.stringify({ "applicant": signup }),
                method: 'POST',
                timeout: 2 * 60 * 1000,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            $http(request).then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error, null);
            });
        }; //generateOtp

        this.generateEmailOtp = function (signup, callback) {
            var request = {
                url: getFullUrl('/signup/send/email/otp'),
                data: JSON.stringify({ applicant: signup }),
                method: 'POST',
                timeout: 2 * 60 * 1000,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            $http(request).then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error, null);
            });
        }; //generateOtpForEmail

        this.confirmEmailOtp = function (signup, callback) {
            var request = {
                url: getFullUrl('/signup/confirm/email/otp/'),
                data: JSON.stringify({ applicant: signup }),
                method: 'POST',
                timeout: 2 * 60 * 1000,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            $http(request).then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error, null);
            });
        }; //confirmEmailOtp

        this.confirmOtp = function (signup, contactNo, callback) {
            var request = {
                url: getFullUrl('/signup/confirm/mobile/otp/') + contactNo + "/" + signup.otp,
                method: 'POST',
                timeout: 2 * 60 * 1000,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            $http(request).then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error, null);
            });
        }; //confirmOtp

        this.signup = function (signup, callback) {
            var request = {
                url: getFullUrl('/signup'),
                data: JSON.stringify({ applicant: signup }),
                method: 'POST',
                timeout: 2 * 60 * 1000,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            $http(request).then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error, null);
            });
        }; //signup

        this.verifyPasscode = function (signup, callback) {
            var request = {
                url: getFullUrl('/signup/verify'),
                data: JSON.stringify(signup),
                method: 'POST',
                timeout: 2 * 60 * 1000,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            $http(request).then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error, null);
            });
        }; //verifyPasscode

        this.changePassword = function (passwordChangeRequest, callback) {
            var request = {
                url: getFullUrl('/login/change/password/' + passwordChangeRequest.contactNo),
                data: JSON.stringify(passwordChangeRequest),
                method: 'POST',
                timeout: 2 * 60 * 1000,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            $http(request).then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error, null);
            });
        };

        this.login = function (user, callback) {
            var request = {
                url: getFullUrl('/login'),
                data: JSON.stringify({ "applicant": user }),
                method: 'POST',
                timeout: 2 * 60 * 1000,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            $http(request).then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error, null);
            });
        }; //login

        this.setUserSessionInBrowserForApplicant = function (sessionInfo, callback) {
            if (sessionInfo.token) {
                sessionStorage.setItem("applicantDetails", JSON.stringify(sessionInfo));
                sessionStorage.setItem("applicantAccessToken", sessionInfo.token);
                $http.defaults.headers.common['ApplicantAuthorization'] = sessionInfo.token;
                $http.defaults.headers.common['ContactNo'] = sessionInfo.contactNo;
                callback(null, sessionInfo);
            }
        }

        this.setUserSessionInBrowser = function (adminDetails, accessToken, callback) {
            sessionStorage.setItem("adminDetails", JSON.stringify(adminDetails));
            sessionStorage.setItem("accessToken", accessToken);
            $http.defaults.headers.common['Authorization'] = accessToken;
            callback(null, adminDetails);
        }


        this.validateApplicationForm = function (application, callback) {
            var request = {
                url: getFullUrl('/applicant/register'),
                data: JSON.stringify({ 'applicant': application }),
                method: 'POST',
                timeout: 2 * 60 * 1000,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            $http(request).then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error, null);
            });
        };

        this.updateNeedsCorrectionSection = function (applicantNo, applicant, callback) {
            var request = {
                url: getFullUrl('/application/update/') + applicantNo,
                data: JSON.stringify({ "applicant": applicant }),
                method: 'put',
                timeout: 2 * 60 * 1000,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            $http(request).then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error, null);
            });
        };

        this.formatServerErrorMsg = function (error, scopeObject, serverSideValidation) {
            if (!error) {
                return;
            }

            const serverErrorMsgPrefix = "There is a server side error.";
            const serverErrorMsgRetryLater = "We request you to go back and retry later.";
            const retryRegularExpression = new RegExp("retry", "i");

            function findRetryErrorMessage(message) {
                return retryRegularExpression.test(message);
            }

            scopeObject.serverErrorMsgs = [];

            if (!serverSideValidation) {
                scopeObject.serverErrorMsgs.push(serverErrorMsgPrefix);
            }

            scopeObject.serverError = true;

            if ((error.data) && (error.data.message)) {
                var msgObj = error.data.message;
                try {
                    msgObj = JSON.parse(msgObj);
                }
                catch (e) {
                }

                if (msgObj instanceof Array) {
                    msgObj.forEach(function (errElement) {
                        scopeObject.serverErrorMsgs.push(errElement.message);
                    });
                } else {
                    scopeObject.serverErrorMsgs.push(error.data.message);
                }
            } else {
                scopeObject.serverErrorMsgs.push(error.statusText);
            }

            if (!serverSideValidation && !scopeObject.serverErrorMsgs.find(findRetryErrorMessage)) {
                scopeObject.serverErrorMsgs.push(serverErrorMsgRetryLater);
            }

            scopeObject.serverErrorMsg = scopeObject.serverErrorMsgs.join(" ");
        };
    }

    angular.module('ies').service('applicantService', applicantService)
    applicantService.$inject = ['$http', '$rootScope'];

    function applicantService($http, $rootScope) {

        this.enableToEdit = function (applicantNo, callback) {
            var requestPromise = $http({
                method: "put",
                headers: { 'Content-Type': 'application/json' },
                url: '/applicant/enable/edit/' + applicantNo
            });
            requestPromise.then(function (response) {
                callback(null, response.data)
            }, function (error) {
                callback(error, null);
            });
        }

        this.getVerificationStatusEnums = function (callback) {
            var requestPromise = $http({
                method: "get",
                headers: { 'Content-Type': 'application/json' },
                url: '/enums'
            });
            requestPromise.then(function (response) {
                callback(null, response.data)
            }, function (error) {
                callback(error, null);
            });
        };

        this.getConfigDetails = function (callback) {
            var url = getFullUrl('/login/config');
            var request = {
                url: url,
                method: 'GET'
            };
            $http(request).then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error, null);
            });
        }; //getConfigDetails for testing

        this.refreshSessionTokenForApplicant = function (contactNo, callback) {
            var responsePromise = $http({
                method: 'put',
                headers: {
                    'Content-Type': 'application/json'
                },
                url: getFullUrl('/login/refresh/token/' + contactNo)
            });
            responsePromise.then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error, null);
            });
        };

        this.logoutApplicantSession = function (contactNo, callback) {
            var request = {
                url: getFullUrl('/login/token/' + contactNo),
                method: 'delete',
                timeout: 2 * 60 * 1000,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            $http(request).then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error, null);
            });
        };

        this.getLookUps = function (callback) {
            var url = getFullUrl('/lookups/');
            var request = {
                url: url,
                method: 'GET'
            };
            $http(request).then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error, null);
            });
        };

        this.getDefaultSubjectPattern = function (board, callback) {
            var requestPromise = $http({
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                url: getFullUrl('/applicant/default/subject/pattern/' + board)
            });

            requestPromise.then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error.data, null);
            });
        }

        function getApplicant(applicantNo, callback) {
            var requestPromise = $http({
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                url: getFullUrl('/applicant/' + applicantNo)
            });

            requestPromise.then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error, null);
            });
        }
        this.getApplicant = getApplicant;

        this.saveForm = function (application, callback) {
            var request = {
                url: getFullUrl('/applicant/save'),
                data: JSON.stringify({ "applicant": application }),
                method: 'POST',
                timeout: 2 * 60 * 1000,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            $http(request).then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error, null);
            });
        }; //saveApplicationForm

        this.saveAndCopy = function (application, callback) {
            var request = {
                url: getFullUrl('/applicant/save/and/copy'),
                data: JSON.stringify({ "applicant": application }),
                method: 'POST',
                timeout: 2 * 60 * 1000,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            $http(request).then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error, null);
            });
        };

        this.submit = function (applicantNo, callback) {
            var request = {
                url: getFullUrl('/applicant/submit'),
                data: JSON.stringify({ "applicantNo": applicantNo }),
                method: 'PUT',
                timeout: 2 * 60 * 1000,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            $http(request).then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error.data, null);
            });
        };

        this.updateMarks = function (application, callback) {
            var request = {
                url: getFullUrl('/applicant/marks'),
                data: JSON.stringify({ "applicant": application }),
                method: 'PUT',
                timeout: 2 * 60 * 1000,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            $http(request).then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error.data, null);
            });
        }

        this.updateNeedsCorrectionSection = function (applicantNo, applicant, callback) {
            var request = {
                url: getFullUrl('/applicant/update/needs/correction/') + applicantNo,
                data: JSON.stringify({ "applicant": applicant }),
                method: 'put',
                timeout: 2 * 60 * 1000,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            $http(request).then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error, null);
            });
        };

        this.updatePreference = function (applicantNo, preferences, callback) {
            var request = {
                url: getFullUrl('/applicant/preferences/') + applicantNo,
                data: JSON.stringify({ "preferences": preferences }),
                method: 'put',
                timeout: 2 * 60 * 1000,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            $http(request).then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error, null);
            });
        }

        $rootScope.updateApplicantDetails = function (applicantNo, callback) {
            getApplicant(applicantNo, function (error, response) {
                if (error) {
                    callback ? callback(error, null) : null;
                    return;
                }

                $rootScope.currentApplicant = response;
                callback ? callback(null, response) : null;
            })
        }

        this.getPrograms = function (callback) {
            var request = {
                url: getFullUrl('/programs/'),
                method: 'GET',
                timeout: 2 * 60 * 1000,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            $http(request).then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error, null);
            });
        }

    }

    angular.module('ies').service('commonService', commonService);
    commonService.$inject = ['$http', '$timeout', '$rootScope'];

    function commonService($http, $timeout, $rootScope) {
        // for error message display
        function getErrorMessage(error) {
            if (!error) {
                return "Error";
            }

            if (typeof error == "string") {
                return error;
            }

            if (error.data && (error.data.message)) {
                return error.data.message;
            }

            if (error.message) {
                return error.message;
            }

            if (error.status || error.statusText) {
                var messages = [];
                if (error.status) {
                    messages.push(error.status);
                }
                if (error.statusText) {
                    messages.push(error.statusText);
                }

                var message = messages.join(" - ");
                if (message) {
                    return message;
                }
            }

            return "Error";
        }

        this.getErrorMessage = getErrorMessage;

        // displaying message onto ui
        function showMessage(scopeObj, displayScope, msgScope, error) {
            scopeObj[displayScope] = true;

            if (error) {
                scopeObj[msgScope] = getErrorMessage(error);
            }

            $timeout(function () {
                scopeObj[displayScope] = false;
                if (msgScope) {
                    scopeObj[msgScope] = "";
                }
            }, 15000);
        }

        this.showSuccessMessage = function (scopeObj, displayScope, successMsgScope, message) {
            showMessage(scopeObj, displayScope, successMsgScope, message);
        }

        this.showInfoMessage = function (scopeObj, displayScope, infoMsgScope) {
            showMessage(scopeObj, displayScope, infoMsgScope);
        }

        this.showErrorMessage = function (scopeObj, displayScope, errorMsgScope, error) {
            showMessage(scopeObj, displayScope, errorMsgScope, error);
        }

        this.saveBlob = function (blob, fileName) {
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            var url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        };

        function formatNumber(number) {
            return number || 0;
        }
        this.formatNumber = formatNumber;

        this.getTotalForFieldName = function (array, fieldName) {
            return array.reduce(function (total, currentValue) {
                return total += (fieldName ? formatNumber(currentValue[fieldName]) : formatNumber(currentValue));
            }, 0);
        }
    }

    angular.module('ies').service('s3', s3)
    s3.$inject = ['$http', '$rootScope'];

    function s3($http) {
        this.getUploadUrl = function (contactNo, attachmentName, callback) {
            var responsePromise = $http({
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                url: getFullUrl('/s3/upload/url/') + contactNo + "/" + attachmentName
            });
            responsePromise.then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error, null);
            });
        };

        this.uploadFilesToS3 = function (signedUrl, file, callback) {
            var responsePromise = $http.put(
                signedUrl,
                file,
                { headers: { 'Content-Type': undefined } }
            );
            responsePromise.then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error, null);
            });
        };


        this.getFileObjFromS3 = function (signedUrl, callback) {
            var responsePromise = $http({
                headers: { 'Content-Type': 'application/json' },
                url: signedUrl,
                responseType: "arraybuffer"
            });
            responsePromise.then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error, null);
            });
        };

        this.getDownloadUrl = function (fileObject, callback) {
            var responsePromise = $http({
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                params: { fileObject: fileObject },
                url: getFullUrl('/s3/download/url/')
            });
            responsePromise.then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error, null);
            });
        };

        this.saveSingleCertificate = function (contactNo, attachmentName, fileObject, index, callback) {
            var request = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                data: { fileObject: fileObject },
                timeout: 2 * 60 * 1000,
                url: getFullUrl('/s3/attachment/') + contactNo + "/" + attachmentName + "/" + index,
            };
            $http(request).then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error, null);
            });
        };

        this.removeSingleCertificate = function (contactNo, attachmentName, fileObject, index, callback) {
            var responsePromise = $http({
                method: 'DELETE',
                data: { fileObject: fileObject },
                headers: { 'Content-Type': 'application/json' },
                url: getFullUrl('/s3/attachment/') + contactNo + "/" + attachmentName + "/" + index,
            });
            responsePromise.then(function (responseData) {
                callback(null, responseData.data);
            }, function (error) {
                callback(error, null);
            });
        };

        this.saveMultipleCertificates = function (contactNo, attachmentName, files, semNo, callback) {
            var request = {
                data: { files: files },
                method: 'PUT',
                timeout: 2 * 60 * 1000,
                headers: { 'Content-Type': 'application/json' },
                url: getFullUrl('/s3/attachments/') + contactNo + "/" + attachmentName + "/" + semNo,
            };
            $http(request).then(function (response) {
                callback(null, response.data);
            }, function (error) {
                callback(error, null);
            });
        };

        this.removeMultipleCertificates = function (contactNo, attachmentName, url, semNo, callback) {
            var responsePromise = $http({
                method: 'DELETE',
                data: { url: url },
                headers: { 'Content-Type': 'application/json' },
                url: getFullUrl('/s3/attachments/') + contactNo + "/" + attachmentName + "/" + semNo,
            });
            responsePromise.then(function (responseData) {
                callback(null, responseData.data);
            }, function (error) {
                callback(error, null);
            });
        };

    }

    angular.module('ies').service('manageEnrollmentService', manageEnrollmentService);
    manageEnrollmentService.$inject = ['$http', '$rootScope'];
    function manageEnrollmentService($http, $rootScope) {

        this.getAdmSummary = function (applicantNo, callback) {
            var requestPromise = $http({
                method: "post",
                headers: { 'Content-Type': 'application/json' },
                url: '/manage/enrollment/adm/summary/' + applicantNo
            });
            requestPromise.then(function (response) {
                callback(null, response.data)
            }, function (error) {
                callback(error, null);
            });
        }
    };

    angular.module('ies').service('reportsService', reportsService);
    reportsService.$inject = ['$http', '$rootScope'];
    function reportsService($http, $rootScope) {

        this.getEnrollmentPdf = function (applicantNo, callback) {
            var request = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                url: '/reports/applicant/enrollment/pdf/' + applicantNo,
                responseType: "arraybuffer"
            };
            $http(request).then(function (response) {
                callback(null, response.data);
            }, function (error) {
                const text = String.fromCharCode.apply(null, Array.from(new Uint8Array(error.data)));
                error.data = JSON.parse(text);
                callback(error, null);
            });
        }
    };

})();;
(function () {
    'use strict';

    angular.module('ies').controller('enquiryFormCtrl', enquiryFormCtrl);
    enquiryFormCtrl.$inject = ['$scope', '$rootScope', '$state', '$timeout', '$window', 'labelTranslation', 'signupService', 'applicantService', 'ValidationService', 's3'];
    function enquiryFormCtrl($scope, $rootScope, $state, $timeout, $window, labelTranslation, signupService, applicantService, ValidationService, s3) {

        if (!$rootScope.currentApplicant) {
            $state.go('ies.enquiry.login');
            return;
        } else {
            $scope.applicant = $rootScope.currentApplicant;
        }
        $rootScope.applicationFormLoader = true;
        $scope.markEntryMode = false;
        $scope.$validationOptions = { debounce: 750, preValidateFormElements: false, isolatedScope: $scope };

        var piServerError, ciServerError, academicServerError, preferenceServerError, comiServerError, fiServerError = false;
        $scope.submitAppFormButtonDisable = false;

        if ($scope.applicant.status == "SD" && !($rootScope.markEntryMode || $rootScope.isNeedsCorrection || $rootScope.editPreferenceMode)) {
            $state.go('ies.enquiry.status');
        }
        $scope.assignNeedsCorrectionSections = function () {
            if ($rootScope.currentApplicant && $rootScope.currentApplicant.eduInfo && $rootScope.currentApplicant.eduInfo.isAbnormal)
                delete $rootScope.currentApplicant.eduInfo.isAbnormal;
            $scope.editAllowed = {
                "personalInfo": false,
                "communityInfo": false,
                "familyInfo": false,
                "contactInfo": false,
                "academicInfo": false,
                "preferenceInfo": false
            }
            var sectionNameMap = {
                "generalInfo": ["personalInfo", "communityInfo"],
                "eduInfo": ["academicInfo"]
            };
            var sectionInfoMap = {
                "generalInfo": "Personal Details / Community Details",
                "eduInfo": "Academic Details"
            };
            $scope.msgForNeedsCorrection = [];
            var sectionStatus = $rootScope.currentApplicant.verificationStatus.sectionStatus;
            for (var key in sectionStatus) {
                if (sectionStatus[key] == $rootScope.verificationStatus.NeedsCorrection) {
                    var editableSections = sectionNameMap[key];
                    editableSections.forEach(function (section) {
                        if (Object.keys($scope.editAllowed).includes(section)) {
                            $scope.editAllowed[section] = true;
                        }
                    });
                    $scope.msgForNeedsCorrection.push(sectionInfoMap[key] + " : " + $rootScope.currentApplicant.reviewComments[key]["msg"]);
                }
            };
            $timeout(function () {
                needsCorrectionSectionView();
            }, 250)
        };

        function needsCorrectionSectionView() {
            $('.card-body').removeClass('show');
            $('a.sectiontoggler').attr("aria-expanded", 'false');
            angular.forEach($scope.editAllowed, function (val, key) {
                if (val == true) {
                    switch (key) {
                        case 'personalInfo':
                            $('#personal-body').addClass('show');
                            $('a[ data-target="#personal-body"]').attr("aria-expanded", 'true');
                            break;
                        case 'communityInfo':
                            $('#community-body').addClass('show');
                            $('a[ data-target="#community-body"]').attr("aria-expanded", 'true');
                            break;
                        case 'familyInfo':
                            $('#family-body').addClass('show');
                            $('a[ data-target="#family-body"]').attr("aria-expanded", 'true');
                            break;
                        case 'contactInfo':
                            $('#contact-body').addClass('show');
                            $('a[ data-target="#contact-body"]').attr("aria-expanded", 'true');
                            break;
                        case 'academicInfo':
                            $('#academic-body').addClass('show');
                            $('a[ data-target="#academic-body"]').attr("aria-expanded", 'true');
                            break;
                        case 'preferenceInfo':
                            $('#preference-body').addClass('show');
                            $('a[ data-target="#preference-body"]').attr("aria-expanded", 'true');
                            break;
                    }
                }
            })
        }

        $scope.checkIfNeedsCorrection = function () {
            if (!$rootScope.currentApplicant || !$rootScope.currentApplicant.verificationStatus || !$rootScope.currentApplicant.verificationStatus.sectionStatus) {
                return false;
            }
            var sectionStatus = $rootScope.currentApplicant.verificationStatus.sectionStatus;
            for (var key in sectionStatus) {
                if (sectionStatus[key] == $rootScope.verificationStatus.NeedsCorrection) {
                    return true;
                }
            }
            return false;
        }

        if (!$scope.checkIfNeedsCorrection()) {
            $timeout(function () {
                if ($state.current.name == "ies.enquiry.markEntry") {
                    $('.card-body.collapse').removeClass('show');
                    $('.sectiontoggler').attr("aria-expanded", "false");
                    $('[aria-controls = academic-body]').attr("aria-expanded", "true");
                    $('#academic-body').addClass('show');
                    $('html, body').animate({ scrollTop: $("#tableMarkEntry").offset().top }, 1000);
                }
            }, 1250)
        }


        if (!$rootScope.currentApplicant) {
            //prompt user to login
            $state.go('ies.enquiry.login');
            return;
        } else if (($state.current.name == "ies.enquiry.markEntry")) {
            if ($rootScope.currentApplicant) {
                //already registered, dont allow to enter marks
                if ($rootScope.currentApplicant.eduInfo.marksAvailable && !$scope.checkIfNeedsCorrection()) {
                    $state.go('ies.enquiry.status');
                    return;
                } else if ($scope.checkIfNeedsCorrection()) {
                    $scope.markEntryMode = false;
                } else {
                    $scope.markEntryMode = true;
                }
            } else {
                $scope.markEntryMode = true;
            }
        }
        var hasNeedsCorrection = $scope.checkIfNeedsCorrection();
        if (!$rootScope.markEntryMode && !hasNeedsCorrection && !$rootScope.editPreferenceMode) {
            $scope.editAllowed = {
                "personalInfo": true,
                "communityInfo": true,
                "familyInfo": true,
                "contactInfo": true,
                "academicInfo": true,
                "preferenceInfo": true
            }
        }
        else if ($rootScope.markEntryMode && !$rootScope.editPreferenceMode) {
            $scope.editAllowed = {
                "personalInfo": false,
                "communityInfo": false,
                "familyInfo": false,
                "contactInfo": false,
                "academicInfo": true,
                "preferenceInfo": false
            }
        } else if (hasNeedsCorrection) {
            $scope.assignNeedsCorrectionSections();
        } else if ($rootScope.editPreferenceMode) {
            $scope.editAllowed = {
                "personalInfo": false,
                "communityInfo": false,
                "familyInfo": false,
                "contactInfo": false,
                "academicInfo": false,
                "preferenceInfo": true
            }
            $timeout(function () {
                $('.card-body.collapse').removeClass('show');
                $('.sectiontoggler').attr("aria-expanded", "false");
                $('[aria-controls = preference-body]').attr("aria-expanded", "true");
                $('#preference-body').addClass('show');
            }, 1250);
        }

        var marksAvailable1Id = "#marksAvailable2";
        var marksAvailable2Id = "#marksAvailable1";

        if ($scope.markEntryMode) {
            $scope.applicant.eduInfo.marksAvailable = true;
        }

        $rootScope.hasAbnormalMark = false;
        $scope.docs = {
            "sslcMarkSheet": {
                "error": false,
                "loader": false,
                "fileSize": 0.5,
                "displaySize": "512 kb",
                "maxFile": 2
            },
            "aadhaarCard": {
                "error": false,
                "loader": false,
                "fileSize": 0.5,
                "displaySize": "512 kb",
                "maxFile": 1
            },
            "profilePic": {
                "error": false,
                "loader": false,
                "fileSize": 0.5,
                "displaySize": "512 kb",
                "maxFile": 1
            },
            "communityCert": {
                "error": false,
                "loader": false,
                "fileSize": 0.5,
                "displaySize": "512 kb",
                "maxFile": 1
            },
            "hseMarkSheet": {
                "error": false,
                "loader": false,
                "fileSize": 0.5,
                "displaySize": "512 kb",
                "maxFile": 3
            },
            "jeeScoreSheet": {
                "error": false,
                "loader": false,
                "fileSize": 0.5,
                "displaySize": "512 kb",
                "maxFile": 1
            }
        }


        $scope.triggerDropzoneUpload = function (category) {
            $scope.docs[category].error = false;

            var dropZone = $('.dropzone-click-' + category).get(0).dropzone;
            dropZone.hiddenFileInput.click();
            $('.dropzone-click-' + category).parent().parent().parent().find('.upload-image-custom-error').hide();

        }

        $scope.title = labelTranslation.english;

        function showFailureNotification(message) {
            $scope.serverError = true;
            $scope.serverErrorMsg = message;
            $(window).scrollTop(0);
            $timeout(function () {
                $scope.serverError = false;
            }, 5000);
        };

        function showSuccessNotification(message) {
            $scope.success = true
            $scope.successMsg = message;
            $(window).scrollTop(0);
            $timeout(function () {
                $scope.success = false;
            }, 10000);
        };

        function inputAndPopoverFunction() {
            $('[data-toggle="popover"]').popover();
            $('input').attr('autocomplete', 'off');
        }

        $timeout(function () {
            inputAndPopoverFunction();
        }, 2000);

        $scope.saveAndContinue = function () {
            $scope.success = false;
            $scope.serverError = false;

            if (!$scope.applicant.personalInfo.firstName || !$scope.applicant.personalInfo.dobStr || !$scope.applicant.personalInfo.regNoSSLC) {
                showFailureNotification("In Order to 'Save and continue', please enter your Name, 10th Examination Roll Number and Date of birth.");
                return;
            }

            $scope.saveButtonDisable = true;
            var applicantToSave = JSON.parse(JSON.stringify($scope.applicant));

            $scope.applicationFormLoader = true;

            applicantService.saveForm(applicantToSave, function (err, response) {
                if (!err) {
                    showSuccessNotification('Enquiry form saved successfully.');
                    $scope.saveButtonDisable = false;
                    $rootScope.currentApplicant = response;
                    $scope.applicant = response;
                } else {
                    //stay on the same page while waiting for
                    $scope.saveButtonDisable = false;
                    signupService.formatServerErrorMsg(err, $scope, true);
                }
                $scope.applicationFormLoader = false;
            });

            checkSectionCompletedStatus();
        };

        function checkSectionCompletedStatus() {
            var elem1 = $("#personal-body").find(".ng-invalid.ng-invalid-validation");
            var elem2 = $("#community-body").find(".ng-invalid.ng-invalid-validation");
            var elem3 = $("#family-body").find(".ng-invalid.ng-invalid-validation");
            var elem4 = $("#contact-body").find(".ng-invalid.ng-invalid-validation");
            var elem5 = $("#academic-body").find(".ng-invalid.ng-invalid-validation");
            var elem6 = $("#preference-body").find(".ng-invalid.ng-invalid-validation");

            elem1.length || piServerError ? ($scope.personalSectionField = false) : ($scope.personalSectionField = true);
            elem2.length || comiServerError ? ($scope.communitySectionField = false) : ($scope.communitySectionField = true);
            elem3.length || fiServerError ? ($scope.familyInfoSectionField = false) : ($scope.familyInfoSectionField = true);
            elem4.length || ciServerError ? ($scope.contactSectionField = false) : ($scope.contactSectionField = true);
            elem5.length || academicServerError ? ($scope.academicSectionField = false) : ($scope.academicSectionField = true);
            elem6.length || preferenceServerError ? ($scope.preferenceInfoSectionField = false) : ($scope.preferenceInfoSectionField = true);

        }

        $timeout(function () {
            checkSectionCompletedStatus();
        }, 1000)

        angular.element(document).on('click', '.sectiontoggler', function () {
            checkSectionCompletedStatus();
        })

        angular.element(document).on('click', '.form-section-header', function () {
            checkSectionCompletedStatus();
        });

        $scope.applicant.declared = 0;

        $scope.declareValidation = function (val) {
            if (val == 1) {
                $scope.decInput = 'true'
            } else {
                $scope.decInput = ''
            }
        }

        $scope.initCountryCodePlugin = function () {
            var mobileNoObject = {
                utilsScript: "../assets/js/utils.js",
                separateDialCode: true,
                initialCountry: "in",
                onlyCountries: ['in']
            };
            $scope.fatherContactNoInput = document.querySelector("#fatherContactNo");
            $scope.motherContactNoInput = document.querySelector("#motherContactNo");
            fatherContactNumber = $scope.fatherContactNoInput ? window.intlTelInput($scope.fatherContactNoInput, mobileNoObject) : '';
            motherContactNumber = $scope.motherContactNoInput ? window.intlTelInput($scope.motherContactNoInput, mobileNoObject) : '';
        };
        $timeout(function () {
            $scope.initCountryCodePlugin();
        }, 250);

        var fatherContactNumber, motherContactNumber;
        $scope.countryCodeReset = function (code, modelName) {
            var mobileNoObject = {
                utilsScript: "../assets/js/utils.js",
                separateDialCode: true,
                initialCountry: code,
                onlyCountries: ['in']
            }
            $scope.fatherContactNoInput = document.querySelector("#fatherContactNo");
            $scope.motherContactNoInput = document.querySelector("#motherContactNo");
            if (modelName == 'fatherContactNo') {
                fatherContactNumber.destroy();
                fatherContactNumber = window.intlTelInput($scope.fatherContactNoInput, mobileNoObject);
                $rootScope.validatefatherContactNo = true;
            } else {
                motherContactNumber.destroy();
                motherContactNumber = window.intlTelInput($scope.motherContactNoInput, mobileNoObject);
                $rootScope.validatemotherContactNo = true;
            }
        }

        $scope.parentMobileNumberChange = function (modelName, fieldName) {
            $scope[modelName] = true;
            $scope.applicant[modelName] = "";
            $scope.applicant.familyAndContactInfo[fieldName].contactNo = "";
            $scope.countryCodeReset("in", modelName);
        }

        $scope.verifyAndSetParentsContactNo = function () {
            var parentsContactInfo = ["fatherContactNo", "motherContactNo"];
            var parent = '';
            parentsContactInfo.forEach(function (parentContactNo) {
                parent = (parentContactNo == 'fatherContactNo') ? 'father' : 'mother'
                $scope[parentContactNo + 'ErrorMsg'] = false;
                if ($scope.applicant.familyAndContactInfo && $scope.applicant.familyAndContactInfo[parent] &&
                    $scope.applicant.familyAndContactInfo[parent].contactNo && $rootScope['validate' + parentContactNo]) {
                    $scope[parentContactNo + 'Input'] = document.querySelector('#' + parentContactNo);
                    var contactNumber = window.intlTelInputGlobals.getInstance($scope[parentContactNo + 'Input']);
                    if (contactNumber.isValidNumber()) {
                        if (contactNumber.s.iso2 != 'in') {
                            $scope.applicant.familyAndContactInfo[parent].contactNo = '0' + contactNumber.s.dialCode + '' + $scope.applicant.familyAndContactInfo[parent].contactNo;
                        }
                        $scope[parentContactNo] = false;
                        $scope['validate' + parentContactNo] = false;
                    }
                    else {
                        $scope[parentContactNo + 'ErrorMsg'] = "Please Enter valid Mobile Number";
                        $scope.success = false;
                        $('.card-body').removeClass('show');
                        $('#contact-body').addClass('show');
                        $('a.sectiontoggler').attr("aria-expanded", 'false');
                        $('a[ data-target="#contact-body"]').attr("aria-expanded", 'true');
                        $("html, body").animate({
                            scrollTop: $('#contact-body').offset().top - 250
                        }, 500);
                    }
                }
            });
        }

        var timeOutClear;
        function showErrorMessage(id) {
            $timeout(function () {
                $timeout.cancel(timeOutClear);
                var sectionForm = $(".ng-invalid-validation.ng-touched").parent().closest('.material-card');
                var sectionId = id ? id : sectionForm.children('.card-body').attr('id')
                $('.card-body').removeClass('show');
                $('#' + sectionId).addClass('show');
                $('a.sectiontoggler').attr("aria-expanded", 'false');
                $('a[ data-target="#' + sectionId + '"]').attr("aria-expanded", 'true');
                var targetPosition = $(".ng-invalid-validation.ng-touched").offset().top - 200
                var errorMsg = $(".ng-invalid-validation.ng-touched").parent().find('label').html();
                errorMsg = (errorMsg && errorMsg.length < 100) ? errorMsg : $(".ng-invalid-validation.ng-touched").parent().parent().find('label').html();
                if (errorMsg && errorMsg.length < 100) {
                    $scope.floatingErrorMsg = errorMsg + " Field is Required."
                }
                timeOutClear = $timeout(function () {
                    $scope.floatingErrorMsg = false;
                }, 15000)
                if (targetPosition > 0) {
                    $('html, body').animate({
                        scrollTop: targetPosition
                    }, 750);
                }
            }, 250)
        }

        function showCustomErrorMsg() {
            $timeout(function () {
                $('.card-body').removeClass('show');
                $('#family-body').addClass('show');
                $('a.sectiontoggler').attr("aria-expanded", 'false');
                $('a[ data-target="#family-body"]').attr("aria-expanded", 'true');
                var targetPosition = $("#family-body").offset().top - 200
                if (targetPosition > 0) {
                    $('html, body').animate({
                        scrollTop: targetPosition
                    }, 750);
                }
            }, 250)
        }

        $scope.floatingMsgClose = function () {
            $scope.floatingErrorMsg = false;
        }

        $scope.serverSideErrorMsg = function (error) {
            var allErrorMessage = [];
            var sectionNameFirst = false;

            if (!error && !error.data) {
                return
            }

            if (!error.data.errors && !error.data.missingValues) {
                signupService.formatServerErrorMsg(error, $scope, true);
                document.body.scrollTop = document.documentElement.scrollTop = 0;
                if (!$scope.errorMsgs.length) {
                    $scope.error = false;
                    $scope.errorMsgs = [];
                }
                $scope.serverError = true;
                $timeout(function () {
                    $scope.serverError = false;
                }, 10000);
                return;
            }

            clearAllServerErrors();

            error.data.missingValues = error.data.missingValues.map(function (val) {
                val.field = "Missing " + val.field;
                return val;
            });
            allErrorMessage = [...error.data.errors, ...error.data.missingValues];

            if (allErrorMessage && allErrorMessage.length) {
                allErrorMessage.forEach(function (msg) {
                    const errorMsg = msg.error ? msg.error : msg.field;
                    if (msg && msg.section == 'personalInfo') {
                        $scope.personalInfoErrors.push(errorMsg);
                        piServerError = true;
                        if (!sectionNameFirst) {
                            sectionNameFirst = true;
                            showErrorMessage('personal-body');
                        }
                    } else if (msg && msg.section == 'communityInfo') {
                        $scope.communityInfoErrors.push(errorMsg);
                        comiServerError = true;
                        if (!sectionNameFirst) {
                            sectionNameFirst = true;
                            showErrorMessage('community-body');
                        }
                    } else if (msg && msg.section == 'familyInfo') {
                        $scope.familyInfoErrors.push(errorMsg);
                        fiServerError = true;
                        if (!sectionNameFirst) {
                            sectionNameFirst = true;
                            showErrorMessage('family-body');
                        }
                    } else if (msg && msg.section == 'contactInfo') {
                        $scope.contactInfoErrors.push(errorMsg);
                        ciServerError = true;
                        if (!sectionNameFirst) {
                            sectionNameFirst = true;
                            showErrorMessage('contact-body');
                        }
                    } else if (msg && msg.section == 'eduInfo') {
                        $scope.academicInfoErrors.push(errorMsg)
                        academicServerError = true;
                        if (!sectionNameFirst) {
                            sectionNameFirst = true;
                            showErrorMessage('academic-body');
                        }
                    } else if (msg && msg.section == 'preferenceInfo') {
                        $scope.preferenceInfoErrors.push(errorMsg)
                        preferenceServerError = true;
                        if (!sectionNameFirst) {
                            sectionNameFirst = true;
                            showErrorMessage('preference-body');
                        }
                    }
                })
                checkSectionCompletedStatus();
            }

        }

        function clearAllServerErrors() {
            $scope.personalInfoErrors = [];
            $scope.communityInfoErrors = [];
            $scope.familyInfoErrors = [];
            $scope.contactInfoErrors = [];
            $scope.academicInfoErrors = [];
            $scope.specialCategoryInfo = [];
            $scope.preferenceInfoErrors = [];
            piServerError, ciServerError, academicServerError, preferenceServerError, comiServerError, fiServerError = false;
        }
        clearAllServerErrors();

        $scope.submitApplicationForm = function () {

            checkSectionCompletedStatus();

            $scope.verifyAndSetParentsContactNo();
            if ($scope.fatherContactNoErrorMsg || $scope.motherContactNoErrorMsg) {
                showCustomErrorMsg();
                return;
            }

            $scope.errorMsgs = [];
            $scope.error = false;
            $scope.success = false;

            if (!new ValidationService().checkFormValidity($scope.enquiryForm)) {
                showErrorMessage();
                return;
            }

            if ($rootScope.hasAbnormalMark && !$scope.applicant.eduInfo.isAbnormal) {
                var err = {
                    "data": {
                        "missingValues": [],
                        "errors": [
                            {
                                "section": "eduInfo",
                                "error": "Please select the checkbox."
                            }
                        ]
                    }
                };
                $scope.serverSideErrorMsg(err);
                return;
            }

            $scope.submitAppFormButtonDisable = true;

            var applicantToSubmit = JSON.parse(JSON.stringify($scope.applicant));
            $rootScope.applicationFormLoader = true;
            applicantService.saveAndCopy(applicantToSubmit, function (err, response) {
                if (!err) {
                    $rootScope.currentApplicant = response;
                    $scope.applicant = response;
                    $("#confirmSubmit").modal('hide');
                    $('.modal-backdrop').remove();
                    $scope.submitAppFormButtonDisable = false;

                    $timeout(function () {
                        $rootScope.applicationFormLoader = false;
                        $state.go('ies.enquiry.preview');
                    }, 1000)

                } else {
                    $rootScope.applicationFormLoader = false;
                    //stay on the same page while waiting for
                    $scope.submitAppFormButtonDisable = false;
                    $scope.serverSideErrorMsg(err);
                    document.body.scrollTop = document.documentElement.scrollTop = 0;
                    return false;
                }
            });
        };

        $scope.confirmUpdation = function () {
            $scope.confirmText = "";
            $scope.error = false;
            $scope.success = false;
            if ($scope.fatherContactNoErrorMsg || $scope.motherContactNoErrorMsg) {
                return;
            }
            if (new ValidationService().checkFormValidity($scope.enquiryForm)) {
                var applicantToUpdate = JSON.parse(JSON.stringify($scope.applicant));
                $scope.applicant = applicantToUpdate;

                $('#updateNeedsCorrection').modal('show');
            } else {
                showErrorMessage();
            }
        }

        $scope.updateNeedsCorrection = function () {
            checkSectionCompletedStatus();

            $scope.verifyAndSetParentsContactNo();
            if ($scope.fatherContactNoErrorMsg || $scope.motherContactNoErrorMsg) {
                showCustomErrorMsg();
                return;
            }

            $scope.errorMsgs = [];
            $scope.error = false;
            $scope.success = false;

            if (!new ValidationService().checkFormValidity($scope.enquiryForm)) {
                showErrorMessage();
                return;
            }

            if ($rootScope.hasAbnormalMark && !$scope.applicant.eduInfo.isAbnormal) {
                var err = {
                    "data": {
                        "missingValues": [],
                        "errors": [
                            {
                                "section": "eduInfo",
                                "error": "Please select the checkbox."
                            }
                        ]
                    }
                };
                $scope.serverSideErrorMsg(err);
                return;
            }

            var applicantToSubmit = JSON.parse(JSON.stringify($scope.applicant));

            applicantService.updateNeedsCorrectionSection($scope.applicant.applicantNo, applicantToSubmit, function (err, response) {
                $('#updateNeedsCorrection').modal('hide');
                if (!err) {
                    $rootScope.currentApplicant = response;
                    $scope.applicant = response;

                    $scope.success = true;
                    $scope.successMsg = 'Enquiry form updated successfully.';
                    $timeout(function () {
                        $state.go('ies.enquiry.status');
                    }, 1000);
                } else {
                    $scope.serverSideErrorMsg(err, $scope, true);
                    document.body.scrollTop = document.documentElement.scrollTop = 0;
                    $timeout(function () {
                        $state.go('ies.enquiry.status');
                    }, 10000);
                    return false;
                }
            });
        }
        $scope.updateMarks = function () {
            if (!new ValidationService().checkFormValidity($scope.enquiryForm)) {
                showErrorMessage();
                return;
            }
            if ($rootScope.hasAbnormalMark && !$scope.applicant.eduInfo.isAbnormal) {
                var err = {
                    "data": {
                        "missingValues": [],
                        "errors": [
                            {
                                "section": "eduInfo",
                                "error": "Please select the checkbox."
                            }
                        ]
                    }
                };
                $scope.serverSideErrorMsg(err);
                return;
            }
            $('#registerModal').modal('show');
        }

        $scope.acceptToUpdateMark = function () {
            $rootScope.applicationFormLoader = true;
            applicantService.updateMarks($scope.applicant, function (err, response) {
                if (!err) {
                    $rootScope.currentApplicant = response;
                    $scope.applicant = response;
                    $("#registerModal").modal('hide');
                    $('.modal-backdrop').remove();
                    $timeout(function () {
                        $rootScope.applicationFormLoader = false;
                        $state.go('ies.enquiry.status');
                    }, 1000)

                } else {
                    //stay on the same page while waiting for
                    $rootScope.applicationFormLoader = false;
                    $scope.serverSideErrorMsg(err);
                    document.body.scrollTop = document.documentElement.scrollTop = 0;
                    return false;
                }
            });
        }

        $scope.uploadFileToS3 = function (attachmentName, file, callback) {
            var contactNo = $scope.applicant.contactNo;

            s3.getUploadUrl(contactNo, attachmentName, function (err, res) {
                if (res && res.signedUrl) {
                    if (!$rootScope.skipFileUploadInS3) {
                        s3.uploadFilesToS3(res.signedUrl, file, function (error, result) {
                            if (!error) {
                                file.signedRequest = res;
                                callback(null, file);
                                return;
                            } else {
                                callback(error, null);
                                return;
                            }
                        });
                    } else {
                        file.signedRequest = res;
                        callback(null, file);
                        return;
                    }
                } else {
                    callback(err, null);
                    return;
                }
            });
        }

        $scope.getFileFromS3 = function (fileObject) {
            s3.getDownloadUrl(fileObject, function (err, res) {
                if (res && res.signedUrl) {
                    s3.getFileObjFromS3(res.signedUrl, function (err, res) {
                        if (res) {
                            const blob = new Blob([res], {
                                type: 'image/jpg'
                            });
                            var strWindowFeatures = "location=yes,left=1000,top=100,height=600,width=600,scrollbars=yes,status=yes";
                            var url = URL.createObjectURL(blob);
                            var newWindow = window.open(url, "_blank", strWindowFeatures);
                            newWindow.document.title = fileObject.originalname;
                        } else {
                            console.log("Failed to download the file " + fileObject.originalname);
                        }
                    });
                } else {
                    return;
                }
            });
        }

        $scope.communityDisplayName = function (val) {
            if (val == 'MBC-O') {
                return 'MBC-OTHERS'
            } else {
                return val;
            }
        }

        $scope.displayPictureUrl = "assets/images/blank-photo.jpg";
        $scope.setPicture = function (fileObject) {
            $scope.docs.profilePic.error = false;
            s3.getDownloadUrl(fileObject, function (err, res) {
                if (res && res.signedUrl) {
                    $scope.displayPictureUrl = new URL(res.signedUrl);
                } else {
                    $scope.docs.profilePic.error = true;
                    return;
                }
            });
        }

        $scope.removeValidationFocus = function () {
            $timeout(function () {
                angular.element('.form-control').removeClass('ng-dirty ng-touched');
                angular.element('.ui-select-container').removeClass('ng-dirty ng-touched');
                $('.validation').html('');
            }, 1000)
        }

        $timeout(function () {
            $rootScope.applicationFormLoader = false;
        }, 1500)

        $scope.removeValidationFocus();
        if ($scope.applicant.personalInfo && $scope.applicant.personalInfo.profilePic)
            $scope.setPicture($scope.applicant.personalInfo.profilePic);

        $scope.updatePreference = function () {
            if (!new ValidationService().checkFormValidity($scope.enquiryForm)) {
                showErrorMessage();
                return;
            }

            $rootScope.applicationFormLoader = true;
            applicantService.updatePreference($scope.applicant.applicantNo, $scope.applicant.preferences, function (err, response) {
                $rootScope.applicationFormLoader = false;
                $("#preferenceModal").modal('hide');
                $('.modal-backdrop').remove();
                if (!err) {
                    $rootScope.currentApplicant = response;
                    $scope.applicant = response;
                    $scope.success = true;
                    document.body.scrollTop = document.documentElement.scrollTop = 0;
                    $scope.successMsg = 'Preferred programmes has been updated successfully.';
                    $timeout(function () {
                        $state.go('ies.enquiry.status');
                    }, 1000);

                } else {
                    //stay on the same page while waiting for
                    $scope.serverSideErrorMsg(err);
                    document.body.scrollTop = document.documentElement.scrollTop = 0;
                    return false;
                }
            });
        }
    }

})();;
(function () {
    'use strict';
    angular.module('ies').factory('appFormValidationRules', appFormValidationRules);
    function appFormValidationRules() {

        $.validator.addMethod(
            "datePicker",
            function (value, element) {
                // put your own logic here, this is just a (crappy) example
                console.log(value);
                if (value > '01/01/1993' && value < '31/12/2006') {
                    return value.match(/^\d\d?\/\d\d?\/\d\d\d\d$/);
                }

            },
            "Please enter date in the format dd/mm/yyyy"
        );

        var rules = {};
        rules["ugAppForm"] = {
            'fullName': {
                required: true
            },
            // 'lastName': {
            //     required: true
            // },
            'aadhaarno': {
                required: true,
                maxlength: 12,
                minlength: 12,
                digits: true
            },
            'dobStr': {
                required: true,
                datePicker: true
            },
            'dob-day': {
                required: true
            },
            'dob_month': {
                required: true
            },
            'dob_year': {
                required: true
            },
            'gender': {
                required: true
            },
            'nationality': {
                required: true
            },
            'state': {
                required: true
            },
            'relegselect': {
                required: true
            },
            'castselect': {
                required: function (element) {
                    if ($('#castselect').val() != "entercaste") {
                        var elem = jQuery('#entercaste-error');
                        elem.closest('.form-group').removeClass('has-error');
                        elem.closest('.help-block').remove();
                    }
                    return true;
                }
            },
            'communityselect': {
                required: true
            },
            'communityIssueselect': {
                required: true
            },
            'entercaste': {
                required: function (element) {
                    return $('#castselect').val() == "entercaste";
                }
            },
            'registerno': {
                required: true
            },
            'schoolmedium': {
                required: true
            },
            'Ilang10': {
                required: true
            },
            'Ilang12': {
                required: true
            },
            'Ilangc': {
                required: true
            },
            'aidedCourse': {
                required: function (element) {
                    return ($("[name='sfCourse']").val() == null);
                    // return true;

                }
            },
            'sfCourse': {
                required: function (element) {
                    return ($("[name='aidedCourse']").val() == null);
                    // return true;
                }
            },
            'fathsnametext': {
                required: true
            },
            'fathsoccuptext': {
                required: true
            },
            'fathmobile': {
                required: true,
                phoneUS: true
            },
            'mothsnametext': {
                required: true
            },
            'mothsoccuptext': {
                required: true
            },
            'mothmobile': {
                required: true,
                phoneUS: true
            },
            'nativity': {
                required: true
            },
            'addrline1text': {
                required: true
            },
            'addrline2text': {
                required: true
            },
            'citytext': {
                required: true
            },
            'stateselect': {
                required: true
            },
            'pin': {
                required: true
            },
            'country': {
                required: true
            },
            'caddrline1text': {
                required: function (element) {
                    return !($('#commCheck').is(':checked'))
                }
            },
            'caddrline2text': {
                required: function (element) {
                    return !($('#commCheck').is(':checked'))
                }
            },
            'ccitytext': {
                required: function (element) {
                    return !($('#commCheck').is(':checked'))
                }
            },
            'cstateselect': {
                required: function (element) {
                    return !($('#commCheck').is(':checked'))
                }
            },
            'cpin': {
                required: function (element) {
                    return !($('#commCheck').is(':checked'))
                }
            },
            'ccountry': {
                required: function (element) {
                    return !($('#commCheck').is(':checked'))
                }
            },
            // 'mobileNumers': {
            //     required: true
            // },
            'emailId': {
                required: true
            },
            'tamil': {
                required: true
            },
            'dabled': {
                required: true
            },
            'disabledtype': {
                required: function (element) {
                    return $('#dabledYes').is(':checked');
                }
            },
            'disabledpercent': {
                required: function (element) {
                    return $('#dabledYes').is(':checked');
                },
                integer: true,
                range: [0, 100]
            },
            'disabilityBy': {
                required: function (element) {
                    return $('#dabledYes').is(':checked');
                }
            },
            'exservice': {
                required: true
            },
            'exservicecadre': {
                required: function (element) {
                    return $('#exserviceYes').is(':checked');
                }
            },
            'exservicerankank': {
                required: function (element) {
                    return $('#exserviceYes').is(':checked');
                }
            },
            'exservicenumber': {
                required: function (element) {
                    return $('#exserviceYes').is(':checked');
                }
            },
            'exserviceType': {
                required: function (element) {
                    return $('#exserviceYes').is(':checked');
                }
            },
            // 'exserviceAwards': {
            //     required: function (element) {
            //         return $('#exserviceYes').is(':checked');
            //     }
            // },
            'ncc': {
                required: true
            },
            'rdc': {
                required: function (element) {
                    return $('#nccYes').is(':checked');
                }
            },
            'nccAchievement': {
                required: function (element) {
                    return $('#nccYes').is(':checked');
                }
            },
            'sports': {
                required: true
            },
            'sportsname': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportlevel': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportDetail': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportsname1': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportlevel1': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportDetail1': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportsname2': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportlevel2': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportDetail2': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportsname3': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportlevel3': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportDetail3': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportsname4': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportlevel4': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportDetail4': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportsname5': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportlevel5': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportDetail5': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },

            'schoolname': {
                required: true
            },
            'schoolAddress': {
                required: true
            },
            'schoolplace': {
                required: true
            },
            'schoolboard': {
                required: true
            },
            'schoolboard1': {
                required: function () {
                    return ($('#schoolboard').val() == "OTHER");
                }
            },
            'maxmarks': {
                required: true
            },
            'schoolnature': {
                required: true
            },
            'nametext7': {
                required: true
            },
            'nametext8': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                },
                max: function () {
                    return parseInt($('#maxmarks').val());
                },
                min: function () {
                    return 1;
                }
            },
            'dob_month2': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                }
            },
            'dob_year2': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                }
            },
            'nametext11': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                }
            },
            'nametext12': {
                required: true
            },
            'nametext13': {
                required: function (element) {
                    if (($('#marksAvailable').is(':checked')) && ($('#schoolboard').val() == "TNHSC")) {
                        return true;
                    }
                    if (($('#marksAvailable').is(':checked')) && ($('#nametext12').val() != "NA")) {
                        return true;
                    }
                    return false;
                },
                max: function () {
                    return parseInt($('#maxmarks').val());
                },
                min: function () {
                    return 1;
                }
            },
            'dob_month3': {
                required: function (element) {
                    if (($('#marksAvailable').is(':checked')) && ($('#schoolboard').val() == "TNHSC")) {
                        return true;
                    }
                    if (($('#marksAvailable').is(':checked')) && ($('#nametext12').val() != "NA")) {
                        return true;
                    }
                    return false;
                }
            },
            'dob_year3': {
                required: function (element) {
                    if (($('#marksAvailable').is(':checked')) && ($('#schoolboard').val() == "TNHSC")) {
                        return true;
                    }
                    if (($('#marksAvailable').is(':checked')) && ($('#nametext12').val() != "NA")) {
                        return true;
                    }
                    return false;
                }
            },
            'nametext16': {
                required: function (element) {
                    if (($('#marksAvailable').is(':checked')) && ($('#schoolboard').val() == "TNHSC")) {
                        return true;
                    }
                    if (($('#marksAvailable').is(':checked')) && ($('#nametext12').val() != "NA")) {
                        return true;
                    }
                    return false;
                }
            },
            'nametext17': {
                required: true
            },
            'nametext18': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                },
                max: function () {
                    return parseInt($('#maxmarks').val());
                },
                min: function () {
                    return 1;
                }
            },
            'dob_month4': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                }
            },
            'dob_year4': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                }
            },
            'nametext21': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                }
            },
            'nametext22': {
                required: true
            },
            'nametext23': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                },
                max: function () {
                    return parseInt($('#maxmarks').val());
                },
                min: function () {
                    return 1;
                }
            },
            'dob_month5': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                }
            },
            'dob_year5': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                }
            },
            'nametext26': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                }
            },
            'nametext27': {
                required: true
            },
            'nametext28': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                },
                max: function () {
                    return parseInt($('#maxmarks').val());
                },
                min: function () {
                    return 1;
                }
            },
            'dob_month6': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                }
            },
            'dob_year6': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                }
            },
            'nametext31': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                }
            },
            'nametext32': {
                required: true
            },
            'nametext33': {
                required: function (element) {
                    if (($('#marksAvailable').is(':checked')) && ($('#schoolboard').val() == "TNHSC")) {
                        return true;
                    }
                    if (($('#marksAvailable').is(':checked')) && ($('#nametext32').val() != "NA")) {
                        return true;
                    }
                    return false;
                },
                max: function () {
                    return parseInt($('#maxmarks').val());
                },
                min: function () {
                    return 1;
                }
            },
            'dob_month7': {
                required: function (element) {
                    if (($('#marksAvailable').is(':checked')) && ($('#schoolboard').val() == "TNHSC")) {
                        return true;
                    }
                    if (($('#marksAvailable').is(':checked')) && ($('#nametext32').val() != "NA")) {
                        return true;
                    }
                    return false;
                }
            },
            'dob_year7': {
                required: function (element) {
                    if (($('#marksAvailable').is(':checked')) && ($('#schoolboard').val() == "TNHSC")) {
                        return true;
                    }
                    if (($('#marksAvailable').is(':checked')) && ($('#nametext32').val() != "NA")) {
                        return true;
                    }
                    return false;
                }
            },
            'nametext36': {
                required: function (element) {
                    if (($('#marksAvailable').is(':checked')) && ($('#schoolboard').val() == "TNHSC")) {
                        return true;
                    }
                    if (($('#marksAvailable').is(':checked')) && ($('#nametext32').val() != "NA")) {
                        return true;
                    }
                    return false;
                }
            },
            'declaration': {
                required: true
            }
        };
        rules["pgAppForm"] = {
            'fullName': {
                required: true
            },
            // 'lastName': {
            //     required: true
            // },
            'aadhaarno': {
                required: true,
                maxlength: 12,
                minlength: 12,
                digits: true
            },
            'dobStr': {
                required: true
            },
            'dob-day': {
                required: true
            },
            'dob_month': {
                required: true
            },
            'dob_year': {
                required: true
            },
            'gender': {
                required: true
            },
            'nationality': {
                required: true
            },
            'state': {
                required: true
            },
            'relegselect': {
                required: true
            },
            'castselect': {
                required: function (element) {
                    if ($('#castselect').val() != "entercaste") {
                        var elem = jQuery('#entercaste-error');
                        elem.closest('.form-group').removeClass('has-error');
                        elem.closest('.help-block').remove();
                    }
                    return true
                }
            },
            'communityselect': {
                required: true
            },
            'communityIssueselect': {
                required: true
            },
            'entercaste': {
                required: function (element) {
                    return $('#castselect').val() == "entercaste"
                }
            },
            'registerno': {
                required: true
            },
            'schoolmedium': {
                required: true
            },
            'Ilang10': {
                required: true
            },
            'Ilang12': {
                required: true,

            },
            'Ilangc': {
                required: true
            },
            'aidedCourse': {
                required: function (element) {
                    return ($("[name='sfCourse']").val() == null);

                }
            },
            'sfCourse': {
                required: function (element) {
                    return ($("[name='aidedCourse']").val() == null);
                }
            },
            'fathsnametext': {
                required: true
            },
            'fathsoccuptext': {
                required: true
            },
            'fathmobile': {
                required: true,
                phoneUS: true
            },
            'mothsnametext': {
                required: true
            },
            'mothsoccuptext': {
                required: true
            },
            'mothmobile': {
                required: true,
                phoneUS: true
            },
            'nativity': {
                required: true
            },
            'addrline1text': {
                required: true
            },
            'addrline2text': {
                required: true
            },
            'citytext': {
                required: true
            },
            'stateselect': {
                required: true
            },
            'pin': {
                required: true
            },
            'country': {
                required: true
            },
            'caddrline1text': {
                required: function (element) {
                    return !($('#commCheck').is(':checked'))
                }
            },
            'caddrline2text': {
                required: function (element) {
                    return !($('#commCheck').is(':checked'))
                }
            },
            'ccitytext': {
                required: function (element) {
                    return !($('#commCheck').is(':checked'))
                }
            },
            'cstateselect': {
                required: function (element) {
                    return !($('#commCheck').is(':checked'))
                }
            },
            'cpin': {
                required: function (element) {
                    return !($('#commCheck').is(':checked'))
                }
            },
            'ccountry': {
                required: function (element) {
                    return !($('#commCheck').is(':checked'))
                }
            },
            // 'mobileNumers': {
            //     required: true
            // },
            'emailId': {
                required: true
            },
            'tamil': {
                required: true
            },
            'dabled': {
                required: true
            },
            'disabledtype': {
                required: function (element) {
                    return $('#dabledYes').is(':checked');
                }
            },
            'disabledpercent': {
                required: function (element) {
                    return $('#dabledYes').is(':checked');
                },
                integer: true,
                range: [0, 100]
            },
            'disabilityBy': {
                required: function (element) {
                    return $('#dabledYes').is(':checked');
                }
            },
            'exservice': {
                required: true
            },
            'exservicecadre': {
                required: function (element) {
                    return $('#exserviceYes').is(':checked');
                }
            },
            'exservicerankank': {
                required: function (element) {
                    return $('#exserviceYes').is(':checked');
                }
            },
            'exservicenumber': {
                required: function (element) {
                    return $('#exserviceYes').is(':checked');
                }
            },
            'exserviceType': {
                required: function (element) {
                    return $('#exserviceYes').is(':checked');
                }
            },
            // 'exserviceAwards': {
            //     required: function (element) {
            //         return $('#exserviceYes').is(':checked');
            //     }
            // },
            'ncc': {
                required: true
            },
            'rdc': {
                required: function (element) {
                    return $('#nccYes').is(':checked');
                }
            },
            'nccAchievement': {
                required: function (element) {
                    return $('#nccYes').is(':checked');
                }
            },
            'sports': {
                required: true
            },
            'sportsname': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportlevel': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportDetail': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportsname1': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportlevel1': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportDetail1': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportsname2': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportlevel2': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportDetail2': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportsname3': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportlevel3': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportDetail3': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportsname4': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportlevel4': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportDetail4': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportsname5': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportlevel5': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportDetail5': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'qualifyingExam': {
                required: true
            },
            'monthOfPassing': {
                required: true
            },
            'yearOfPassing': {
                required: true
            },
            'collegename': {
                required: true
            },
            'collegeplace': {
                required: true
            },
            'schoolmedium2': {
                required: true
            },
            'mainsubject': {
                required: true
            },
            'ancilsubject1': {
                required: true
            },
            'ancilsubject2': {
                required: true
            },
            'ancilsubject3': {
                required: true
            },
            'prgmDuration': {
                required: true
            },
            'terms': {
                required: true
            },
            'numSemesters': {
                required: true
            },
            'university': {
                required: true
            },
            'otherUniversity': {
                required: function (element) {
                    return $('#university').val() == "OTHERS";
                }
            },
            'nametext11': {
                required: true
            },
            'nametext16': {
                required: true
            },
            'nametext20': {
                required: true
            },
            'nametext21': {
                required: true
            },
            'nametext7': {
                required: true
            },
            'dob_month2': {
                required: true
            },
            'dob_year2': {
                required: true
            },
            'nametext12': {
                required: true
            },
            'nametext13': {
                required: true
            },
            'nametext22': {
                required: true,
                max: function () {
                    return parseInt($('#nametext23').val());
                }
            },
            'nametext23': {
                required: true
            },
            'nametext24': {
                required: true,
                max: function () {
                    return parseInt($('#nametext25').val());
                }
            },
            'nametext25': {
                required: true
            },
            'nametext26': {
                required: true,
                max: function () {
                    return parseInt($('#nametext27').val());
                }
            },
            'nametext27': {
                required: true
            },
            'declaration': {
                required: true
            }
        };

        return rules;
    }

    angular.module('ies').factory('appFormValidationMsgs', appFormValidationMsgs);
    function appFormValidationMsgs() {
        var messages = {};
        messages["ugAppForm"] = {
            'fullName': {
                required: 'Applicant name is required'
            },
            // 'nametext2': {
            //     required: 'Middle name is required'
            // },
            // 'lastName': {
            //     required: 'Last name is required'
            // },
            'aadhaarno': {
                required: 'Aadhaar number is required',
                minlength: "Exactly 12 digits required",
                maxlength: "Exactly 12 digits required",
                digits: "Enter valid aadhaar number"
            },
            'dobStr': {
                required: 'DOB is required'
            },
            'dob-day': {
                required: 'Day is required'
            },
            'dob_month': {
                required: 'Month is required'
            },
            'dob_year': {
                required: 'Year is required'
            },
            'gender': {
                required: 'Gender is required'
            },
            'nationality': {
                required: 'Nationality is required'
            },
            'residentialStatus': {
                required: 'Residential Status is required'
            },
            'state': {
                required: 'State is required'
            },
            'relegselect': {
                required: 'Religion is required'
            },
            'castselect': {
                required: 'Caste is required'
            },
            'communityselect': {
                required: 'Community is required'
            },
            'communityIssueselect': {
                required: 'Issued by is required'
            },
            'entercaste': {
                required: 'Caste is required'
            },
            'registerno': {
                required: 'Examination Roll is required'
            },
            'schoolmedium': {
                required: 'Medium is required'
            },
            'Ilang10': {
                required: '10th language is required'
            },
            'Ilang12': {
                required: '12th language is required'
            },
            'Ilangc': {
                required: 'Language in college is required'
            },
            'aidedCourse': {
                required: 'Course is required'
            },
            'sfCourse': {
                required: 'Course is required'
            },
            'fathsnametext': {
                required: "Father's name is required"
            },
            'fathsoccuptext': {
                required: "Father's occupation is required"
            },
            'fathmobile': {
                required: "Father's mobile number is required",
                phoneUS: "10 digits required"
            },
            'mothsnametext': {
                required: "Mother's name is required"
            },
            'mothsoccuptext': {
                required: "Mother's occupation is required"
            },
            'mothmobile': {
                required: "Mother's mobile number is required",
                phoneUS: "10 digits required"
            },
            'nativity': {
                required: 'Nativity is required'
            },
            'addrline1text': {
                required: 'Address line1 is required'
            },
            'addrline2text': {
                required: 'Address line2 is required'
            },
            'citytext': {
                required: 'City is required'
            },
            'stateselect': {
                required: 'State is required'
            },
            'pin': {
                required: 'Pincode is required'
            },
            'country': {
                required: 'Country is required'
            },
            'caddrline1text': {
                required: 'Address line1 is required'
            },
            'caddrline2text': {
                required: 'Address line2 is required'
            },
            'ccitytext': {
                required: 'City is required'
            },
            'cstateselect': {
                required: 'State is required'
            },
            'cpin': {
                required: 'Pincode is required'
            },
            'ccountry': {
                required: 'Country is required'
            },
            // 'mobileNumers': {
            //     required: 'Secondary mobile number is required'
            // },
            'emailId': {
                required: 'Email id is required'
            },
            'tamil': {
                required: 'required'
            },
            'dabled': {
                required: 'required'
            },
            'disabledtype': {
                required: 'Type is required'
            },
            'disabledpercent': {
                required: 'Percent is required'
            },
            'disabilityBy': {
                required: 'required'
            },
            'exservice': {
                required: 'required'
            },
            'exservicecadre': {
                required: 'Cadre is required'
            },
            'exservicerankank': {
                required: 'Rank is required'
            },
            'exservicenumber': {
                required: 'Number(ID) is required'
            },
            'exserviceType': {
                required: 'Type is required'
            },
            // 'exserviceAwards': {
            //     required: 'Award is required'
            // },
            'ncc': {
                required: 'required'
            },
            'rdc': {
                required: 'required'
            },
            'nccAchievement': {
                required: 'required'
            },
            'sports': {
                required: 'required'
            },
            'sportsname': {
                required: 'Sport name is required'
            },
            'sportlevel': {
                required: 'Sport level is required'
            },
            'sportDetail': {
                required: 'Achievement detail is required'
            },
            'sportsname1': {
                required: 'Sport name is required'
            },
            'sportlevel1': {
                required: 'Sport level is required'
            },
            'sportDetail1': {
                required: 'Achievement detail is required'
            },
            'sportsname2': {
                required: 'Sport name is required'
            },
            'sportlevel2': {
                required: 'Sport level is required'
            },
            'sportDetail2': {
                required: 'Achievement detail is required'
            },
            'sportsname3': {
                required: 'Sport name is required'
            },
            'sportlevel3': {
                required: 'Sport level is required'
            },
            'sportDetail3': {
                required: 'Achievement detail is required'
            },
            'sportsname4': {
                required: 'Sport name is required'
            },
            'sportlevel4': {
                required: 'Sport level is required'
            },
            'sportDetail4': {
                required: 'Achievement detail is required'
            },
            'sportsname5': {
                required: 'Sport name is required'
            },
            'sportlevel5': {
                required: 'Sport level is required'
            },
            'sportDetail5': {
                required: 'Achievement detail is required'
            },
            'schoolname': {
                required: 'School name is required'
            },
            'schoolAddress': {
                required: 'School address is required'
            },
            'schoolplace': {
                required: 'Location of the school is required'
            },
            'schoolboard': {
                required: 'Board is required'
            },
            'schoolboard1': {
                required: 'Board is required'
            },
            'maxmarks': {
                required: 'Max mark is required'
            },
            'schoolnature': {
                required: 'Group Type is required'
            },
            'nametext7': {
                required: 'Subject is required'
            },
            'nametext8': {
                required: 'Mark is required',
                max: 'Not more than max marks',
                min: 'Enter more than zero'
            },
            'dob_month2': {
                required: 'Month is required'
            },
            'dob_year2': {
                required: 'Year is required'
            },
            'nametext11': {
                required: 'Examination Roll Number is required'
            },
            'nametext12': {
                required: 'Subject is required'
            },
            'nametext13': {
                required: 'Mark is required',
                max: 'Not more than max marks',
                min: 'Enter more than zero'
            },
            'dob_month3': {
                required: 'Month is required'
            },
            'dob_year3': {
                required: 'Year is required'
            },
            'nametext16': {
                required: 'Examination Roll Number is required'
            },
            'nametext17': {
                required: 'Subject is required'
            },
            'nametext18': {
                required: 'Mark is required',
                max: 'Not more than max marks',
                min: 'Enter more than zero'
            },
            'dob_month4': {
                required: 'Month is required'
            },
            'dob_year4': {
                required: 'Year is required'
            },
            'nametext21': {
                required: 'Examination Roll Number is required'
            },
            'nametext22': {
                required: 'Subject is required'
            },
            'nametext23': {
                required: 'Mark is required',
                max: 'Not more than max marks',
                min: 'Enter more than zero'
            },
            'dob_month5': {
                required: 'Month is required'
            },
            'dob_year5': {
                required: 'Year is required'
            },
            'nametext26': {
                required: 'Examination Roll Number is required'
            },
            'nametext27': {
                required: 'Subject is required'
            },
            'nametext28': {
                required: 'Mark is required',
                max: 'Not more than max marks',
                min: 'Enter more than zero'
            },
            'dob_month6': {
                required: 'Month is required'
            },
            'dob_year6': {
                required: 'Year is required'
            },
            'nametext31': {
                required: 'Examination Roll Number is required'
            },
            'nametext32': {
                required: 'Subject is required'
            },
            'nametext33': {
                required: 'Mark is required',
                max: 'Not more than max marks',
                min: 'Enter more than zero'
            },
            'dob_month7': {
                required: 'Month is required'
            },
            'dob_year7': {
                required: 'Year is required'
            },
            'nametext36': {
                required: 'Examination Roll Number is required'
            },
            'declaration': {
                required: 'You must agree before submitting'
            }
        };
        messages["pgAppForm"] = {
            'fullName': {
                required: 'Applicant name is required'
            },
            // 'nametext2': {
            //     required: 'Middle name is required'
            // },
            // 'lastName': {
            //     required: 'Last name is required'
            // },
            'aadhaarno': {
                required: 'Aadhaar number is required',
                minlength: "Exactly 12 digits required",
                maxlength: "Exactly 12 digits required",
                digits: "Enter valid aadhaar number"
            },
            'dobStr': {
                required: 'DOB is required'
            },
            'dob-day': {
                required: 'Day is required'
            },
            'dob_month': {
                required: 'Month is required'
            },
            'dob_year': {
                required: 'Year is required'
            },
            'gender': {
                required: 'Gender is required'
            },
            'nationality': {
                required: 'Nationality is required'
            },
            'residentialStatus': {
                required: 'Residential Status is required'
            },
            'state': {
                required: 'State is required'
            },
            'relegselect': {
                required: 'Religion is required'
            },
            'castselect': {
                required: 'Caste is required'
            },
            'communityselect': {
                required: 'Community is required'
            },
            'communityIssueselect': {
                required: 'Issued by is required'
            },
            'entercaste': {
                required: 'Caste is required'
            },
            'registerno': {
                required: 'Examination Roll Number is required'
            },
            'schoolmedium': {
                required: 'Medium is required'
            },
            'Ilang10': {
                required: '10th language is required'
            },
            'Ilang12': {
                required: '12th language is required'
            },
            'Ilangc': {
                required: 'Language in college is required'
            },
            'aidedCourse': {
                required: 'Course is required'
            },
            'sfCourse': {
                required: 'Course is required'
            },
            'fathsnametext': {
                required: "Father's name is required"
            },
            'fathsoccuptext': {
                required: "Father's occupation is required"
            },
            'fathmobile': {
                required: "Father's mobile number is required",
                phoneUS: "10 digits required"
            },
            'mothsnametext': {
                required: "Mother's name is required"
            },
            'mothsoccuptext': {
                required: "Mother's occupation is required"
            },
            'mothmobile': {
                required: "Mother's mobile number is required",
                phoneUS: "10 digits required"
            },
            'nativity': {
                required: 'Nativity is required'
            },
            'addrline1text': {
                required: 'Address line1 is required'
            },
            'addrline2text': {
                required: 'Address line2 is required'
            },
            'citytext': {
                required: 'City is required'
            },
            'stateselect': {
                required: 'State is required'
            },
            'pin': {
                required: 'Pincode is required'
            },
            'country': {
                required: 'Country is required'
            },
            'caddrline1text': {
                required: 'Address line1 is required'
            },
            'caddrline2text': {
                required: 'Address line2 is required'
            },
            'ccitytext': {
                required: 'City is required'
            },
            'cstateselect': {
                required: 'State is required'
            },
            'cpin': {
                required: 'Pincode is required'
            },
            'ccountry': {
                required: 'Country is required'
            },
            // 'mobileNumers': {
            //     required: 'Secondary mobile number is required'
            // },
            'emailId': {
                required: 'Email id is required'
            },
            'tamil': {
                required: 'required'
            },
            'dabled': {
                required: 'required'
            },
            'disabledtype': {
                required: 'Type is required'
            },
            'disabledpercent': {
                required: 'Percent is required'
            },
            'disabilityBy': {
                required: 'required'
            },
            'exservice': {
                required: 'required'
            },
            'exservicecadre': {
                required: 'Cadre is required'
            },
            'exservicerankank': {
                required: 'Rank is required'
            },
            'exservicenumber': {
                required: 'Number(ID) is required'
            },
            'exserviceType': {
                required: 'Type is required'
            },
            // 'exserviceAwards': {
            //     required: 'Award is required'
            // },
            'ncc': {
                required: 'required'
            },
            'rdc': {
                required: 'required'
            },
            'nccAchievement': {
                required: 'required'
            },
            'sports': {
                required: 'required'
            },
            'sportsname': {
                required: 'Sport name is required'
            },
            'sportlevel': {
                required: 'Sport level is required'
            },
            'sportDetail': {
                required: 'Achievement detail is required'
            },
            'sportsname1': {
                required: 'Sport name is required'
            },
            'sportlevel1': {
                required: 'Sport level is required'
            },
            'sportDetail1': {
                required: 'Achievement detail is required'
            },
            'sportsname2': {
                required: 'Sport name is required'
            },
            'sportlevel2': {
                required: 'Sport level is required'
            },
            'sportDetail2': {
                required: 'Achievement detail is required'
            },
            'sportsname3': {
                required: 'Sport name is required'
            },
            'sportlevel3': {
                required: 'Sport level is required'
            },
            'sportDetail3': {
                required: 'Achievement detail is required'
            },
            'sportsname4': {
                required: 'Sport name is required'
            },
            'sportlevel4': {
                required: 'Sport level is required'
            },
            'sportDetail4': {
                required: 'Achievement detail is required'
            },
            'sportsname5': {
                required: 'Sport name is required'
            },
            'sportlevel5': {
                required: 'Sport level is required'
            },
            'sportDetail5': {
                required: 'Achievement detail is required'
            },
            'qualifyingexam': {
                required: 'Qualification is required'
            },
            'monthOfPassing': {
                required: 'Month is required'
            },
            'yearOfPassing': {
                required: 'Year is required'
            },
            'collegename': {
                required: 'College name is required'
            },
            'collegeplace': {
                required: 'Place of college is required'
            },
            'schoolmedium2': {
                required: 'Medium is required'
            },
            'mainsubject': {
                required: 'Major/Branch is required'
            },
            'ancilsubject1': {
                required: 'Subject1 is required'
            },
            'ancilsubject2': {
                required: 'Subject2 is required'
            },
            'ancilsubject3': {
                required: 'Subject3 is required'
            },
            'prgmDuration': {
                required: 'Program duration is required'
            },
            'terms': {
                required: "Terms are required"
            },
            'numSemesters': {
                required: 'No.of semester is required'
            },
            'university': {
                required: 'University name is required'
            },
            'otherUniversity': {
                required: 'University name is required'
            },
            'nametext11': {
                required: 'Percentage is required'
            },
            'nametext16': {
                required: 'Percentage is required'
            },
            'nametext21': {
                required: 'Percentage is required'
            },
            'nametext7': {
                required: 'Subject is required'
            },
            'dob_month2': {
                required: 'required'
            },
            'dob_year2': {
                required: 'required'
            },
            'nametext12': {
                required: 'required'
            },
            'nametext13': {
                required: 'required'
            },
            'nametext22': {
                required: 'required',
                max: 'Not more than max marks'
            },
            'nametext23': {
                required: 'required'
            },
            'nametext24': {
                required: 'required',
                max: 'Not more than max marks'
            },
            'nametext25': {
                required: 'required'
            },
            'nametext26': {
                required: 'required',
                max: 'Not more than max marks'
            },
            'nametext27': {
                required: 'required'
            },
            'declaration': {
                required: 'You must agree before submitting'
            }
        };

        return messages;
    }

    angular.module('ies').factory('regFormValidationRules', regFormValidationRules);
    function regFormValidationRules() {
        var rules = {};
        rules["ugAppForm"] = {
            'fullName': {
                required: true
            },
            // 'lastName': {
            //     required: true
            // },
            'aadhaarno': {
                required: true,
                maxlength: 12,
                minlength: 12,
                digits: true
            },
            'dobStr': {
                required: true
            },
            'dob-day': {
                required: true
            },
            'dob_month': {
                required: true
            },
            'dob_year': {
                required: true
            },
            'gender': {
                required: true
            },
            'nationality': {
                required: true
            },
            'state': {
                required: true
            },
            'relegselect': {
                required: true
            },
            'castselect': {
                required: function (element) {
                    if ($('#castselect').val() != "entercaste") {
                        var elem = jQuery('#entercaste-error');
                        elem.closest('.form-group').removeClass('has-error');
                        elem.closest('.help-block').remove();
                    }
                    return true;
                }
            },
            'communityselect': {
                required: true
            },
            'communityIssueselect': {
                required: true
            },
            'entercaste': {
                required: function (element) {
                    return $('#castselect').val() == "entercaste";
                }
            },
            'registerno': {
                required: true
            },
            'schoolmedium': {
                required: true
            },
            'Ilang10': {
                required: true
            },
            'Ilang12': {
                required: true
            },
            'Ilangc': {
                required: true
            },
            'aidedCourse': {
                required: function (element) {
                    return ($("[name='sfCourse']").val() == null);
                    // return true;

                }
            },
            'sfCourse': {
                required: function (element) {
                    return ($("[name='aidedCourse']").val() == null);
                    // return true;
                }
            },
            'fathsnametext': {
                required: true
            },
            'fathsoccuptext': {
                required: true
            },
            'fathmobile': {
                required: true,
                phoneUS: true
            },
            'mothsnametext': {
                required: true
            },
            'mothsoccuptext': {
                required: true
            },
            'mothmobile': {
                required: true,
                phoneUS: true
            },
            'nativity': {
                required: true
            },
            'addrline1text': {
                required: true
            },
            'addrline2text': {
                required: true
            },
            'citytext': {
                required: true
            },
            'stateselect': {
                required: true
            },
            'pin': {
                required: true
            },
            'country': {
                required: true
            },
            'caddrline1text': {
                required: function (element) {
                    return !($('#commCheck').is(':checked'))
                }
            },
            'caddrline2text': {
                required: function (element) {
                    return !($('#commCheck').is(':checked'))
                }
            },
            'ccitytext': {
                required: function (element) {
                    return !($('#commCheck').is(':checked'))
                }
            },
            'cstateselect': {
                required: function (element) {
                    return !($('#commCheck').is(':checked'))
                }
            },
            'cpin': {
                required: function (element) {
                    return !($('#commCheck').is(':checked'))
                }
            },
            'ccountry': {
                required: function (element) {
                    return !($('#commCheck').is(':checked'))
                }
            },
            // 'mobileNumers': {
            //     required: true
            // },
            'emailId': {
                required: true
            },
            'tamil': {
                required: true
            },
            'dabled': {
                required: true
            },
            'disabledtype': {
                required: function (element) {
                    return $('#dabledYes').is(':checked');
                }
            },
            'disabledpercent': {
                required: function (element) {
                    return $('#dabledYes').is(':checked');
                },
                integer: true,
                range: [0, 100]
            },
            'disabilityBy': {
                required: function (element) {
                    return $('#dabledYes').is(':checked');
                }
            },
            'exservice': {
                required: true
            },
            'exservicecadre': {
                required: function (element) {
                    return $('#exserviceYes').is(':checked');
                }
            },
            'exservicerankank': {
                required: function (element) {
                    return $('#exserviceYes').is(':checked');
                }
            },
            'exservicenumber': {
                required: function (element) {
                    return $('#exserviceYes').is(':checked');
                }
            },
            'exserviceType': {
                required: function (element) {
                    return $('#exserviceYes').is(':checked');
                }
            },
            // 'exserviceAwards': {
            //     required: function (element) {
            //         return $('#exserviceYes').is(':checked');
            //     }
            // },
            'ncc': {
                required: true
            },
            'rdc': {
                required: function (element) {
                    return $('#nccYes').is(':checked');
                }
            },
            'nccAchievement': {
                required: function (element) {
                    return $('#nccYes').is(':checked');
                }
            },
            'sports': {
                required: true
            },
            'sportsname': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportlevel': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportDetail': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportsname1': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportlevel1': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportDetail1': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportsname2': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportlevel2': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportDetail2': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportsname3': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportlevel3': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportDetail3': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportsname4': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportlevel4': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportDetail4': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportsname5': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportlevel5': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportDetail5': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'schoolname': {
                required: true
            },
            'schoolAddress': {
                required: true
            },
            'schoolplace': {
                required: true
            },
            'schoolboard': {
                required: true
            },
            'schoolboard1': {
                required: function () {
                    return ($('#schoolboard').val() == "OTHER");
                }
            },
            'maxmarks': {
                required: true
            },
            'schoolnature': {
                required: true
            },
            'nametext8': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                },
                max: function () {
                    return parseInt($('#maxmarks').val());
                },
                min: function () {
                    return 1;
                }
            },
            'dob_month2': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                }
            },
            'dob_year2': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                }
            },
            'nametext11': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                }
            },
            'nametext13': {
                required: function (element) {
                    if (($('#marksAvailable').is(':checked')) && ($('#schoolboard').val() == "TNHSC")) {
                        return true;
                    }
                    if (($('#marksAvailable').is(':checked')) && ($('#nametext12').val() != "NA")) {
                        return true;
                    }
                    return false;
                },
                max: function () {
                    return parseInt($('#maxmarks').val());
                },
                min: function () {
                    return 1;
                }
            },
            'dob_month3': {
                required: function (element) {
                    if (($('#marksAvailable').is(':checked')) && ($('#schoolboard').val() == "TNHSC")) {
                        return true;
                    }
                    if (($('#marksAvailable').is(':checked')) && ($('#nametext12').val() != "NA")) {
                        return true;
                    }
                    return false;
                }
            },
            'dob_year3': {
                required: function (element) {
                    if (($('#marksAvailable').is(':checked')) && ($('#schoolboard').val() == "TNHSC")) {
                        return true;
                    }
                    if (($('#marksAvailable').is(':checked')) && ($('#nametext12').val() != "NA")) {
                        return true;
                    }
                    return false;
                }
            },
            'nametext16': {
                required: function (element) {
                    if (($('#marksAvailable').is(':checked')) && ($('#schoolboard').val() == "TNHSC")) {
                        return true;
                    }
                    if (($('#marksAvailable').is(':checked')) && ($('#nametext12').val() != "NA")) {
                        return true;
                    }
                    return false;
                }
            },
            'nametext18': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                },
                max: function () {
                    return parseInt($('#maxmarks').val());
                },
                min: function () {
                    return 1;
                }
            },
            'dob_month4': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                }
            },
            'dob_year4': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                }
            },
            'nametext21': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                }
            },
            'nametext23': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                },
                max: function () {
                    return parseInt($('#maxmarks').val());
                },
                min: function () {
                    return 1;
                }
            },
            'dob_month5': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                }
            },
            'dob_year5': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                }
            },
            'nametext26': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                }
            },
            'nametext28': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                },
                max: function () {
                    return parseInt($('#maxmarks').val());
                },
                min: function () {
                    return 1;
                }
            },
            'dob_month6': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                }
            },
            'dob_year6': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                }
            },
            'nametext31': {
                required: function (element) {
                    if ($('#marksAvailable').is(':checked')) {
                        return true;
                    }
                    return false;
                }
            },
            'nametext33': {
                required: function (element) {
                    if (($('#marksAvailable').is(':checked')) && ($('#schoolboard').val() == "TNHSC")) {
                        return true;
                    }
                    if (($('#marksAvailable').is(':checked')) && ($('#nametext32').val() != "NA")) {
                        return true;
                    }
                    return false;
                },
                max: function () {
                    return parseInt($('#maxmarks').val());
                },
                min: function () {
                    return 1;
                }
            },
            'dob_month7': {
                required: function (element) {
                    if (($('#marksAvailable').is(':checked')) && ($('#schoolboard').val() == "TNHSC")) {
                        return true;
                    }
                    if (($('#marksAvailable').is(':checked')) && ($('#nametext32').val() != "NA")) {
                        return true;
                    }
                    return false;
                }
            },
            'dob_year7': {
                required: function (element) {
                    if (($('#marksAvailable').is(':checked')) && ($('#schoolboard').val() == "TNHSC")) {
                        return true;
                    }
                    if (($('#marksAvailable').is(':checked')) && ($('#nametext32').val() != "NA")) {
                        return true;
                    }
                    return false;
                }
            },
            'nametext36': {
                required: function (element) {
                    if (($('#marksAvailable').is(':checked')) && ($('#schoolboard').val() == "TNHSC")) {
                        return true;
                    }
                    if (($('#marksAvailable').is(':checked')) && ($('#nametext32').val() != "NA")) {
                        return true;
                    }
                    return false;
                }
            },
            'declaration': {
                required: true
            }
        };
        rules["pgAppForm"] = {
            'fullName': {
                required: true
            },
            // 'lastName': {
            //     required: true
            // },
            'aadhaarno': {
                required: true,
                maxlength: 12,
                minlength: 12,
                digits: true
            },
            'dobStr': {
                required: true
            },
            'dob-day': {
                required: true
            },
            'dob_month': {
                required: true
            },
            'dob_year': {
                required: true
            },
            'gender': {
                required: true
            },
            'nationality': {
                required: true
            },
            'state': {
                required: true
            },
            'relegselect': {
                required: true
            },
            'castselect': {
                required: function (element) {
                    if ($('#castselect').val() != "entercaste") {
                        var elem = jQuery('#entercaste-error');
                        elem.closest('.form-group').removeClass('has-error');
                        elem.closest('.help-block').remove();
                    }
                    return true
                }
            },
            'communityselect': {
                required: true
            },
            'communityIssueselect': {
                required: true
            },
            'entercaste': {
                required: function (element) {
                    return $('#castselect').val() == "entercaste"
                }
            },
            'registerno': {
                required: true
            },
            'schoolmedium': {
                required: true
            },
            'Ilang10': {
                required: true
            },
            'Ilang12': {
                required: true
            },
            'Ilangc': {
                required: true
            },
            'aidedCourse': {
                required: function (element) {
                    return ($("[name='sfCourse']").val() == null);

                }
            },
            'sfCourse': {
                required: function (element) {
                    return ($("[name='aidedCourse']").val() == null);
                }
            },
            'fathsnametext': {
                required: true
            },
            'fathsoccuptext': {
                required: true
            },
            'fathmobile': {
                required: true,
                phoneUS: true
            },
            'mothsnametext': {
                required: true
            },
            'mothsoccuptext': {
                required: true
            },
            'mothmobile': {
                required: true,
                phoneUS: true
            },
            'nativity': {
                required: true
            },
            'addrline1text': {
                required: true
            },
            'addrline2text': {
                required: true
            },
            'citytext': {
                required: true
            },
            'stateselect': {
                required: true
            },
            'pin': {
                required: true
            },
            'country': {
                required: true
            },
            'caddrline1text': {
                required: function (element) {
                    return !($('#commCheck').is(':checked'))
                }
            },
            'caddrline2text': {
                required: function (element) {
                    return !($('#commCheck').is(':checked'))
                }
            },
            'ccitytext': {
                required: function (element) {
                    return !($('#commCheck').is(':checked'))
                }
            },
            'cstateselect': {
                required: function (element) {
                    return !($('#commCheck').is(':checked'))
                }
            },
            'cpin': {
                required: function (element) {
                    return !($('#commCheck').is(':checked'))
                }
            },
            'ccountry': {
                required: function (element) {
                    return !($('#commCheck').is(':checked'))
                }
            },
            // 'mobileNumers': {
            //     required: true
            // },
            'emailId': {
                required: true
            },
            'tamil': {
                required: true
            },
            'dabled': {
                required: true
            },
            'disabledtype': {
                required: function (element) {
                    return $('#dabledYes').is(':checked');
                }
            },
            'disabledpercent': {
                required: function (element) {
                    return $('#dabledYes').is(':checked');
                },
                integer: true,
                range: [0, 100]
            },
            'disabilityBy': {
                required: function (element) {
                    return $('#dabledYes').is(':checked');
                }
            },
            'exservice': {
                required: true
            },
            'exservicecadre': {
                required: function (element) {
                    return $('#exserviceYes').is(':checked');
                }
            },
            'exservicerankank': {
                required: function (element) {
                    return $('#exserviceYes').is(':checked');
                }
            },
            'exservicenumber': {
                required: function (element) {
                    return $('#exserviceYes').is(':checked');
                }
            },
            'exserviceType': {
                required: function (element) {
                    return $('#exserviceYes').is(':checked');
                }
            },
            // 'exserviceAwards': {
            //     required: function (element) {
            //         return $('#exserviceYes').is(':checked');
            //     }
            // },
            'ncc': {
                required: true
            },
            'rdc': {
                required: function (element) {
                    return $('#nccYes').is(':checked');
                }
            },
            'nccAchievement': {
                required: function (element) {
                    return $('#nccYes').is(':checked');
                }
            },
            'sports': {
                required: true
            },
            'sportsname': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportlevel': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportDetail': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportsname1': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportlevel1': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportDetail1': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportsname2': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportlevel2': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportDetail2': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportsname3': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportlevel3': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportDetail3': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportsname4': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportlevel4': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportDetail4': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportsname5': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportlevel5': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'sportDetail5': {
                required: function (element) {
                    return $('#sportsYes').is(':checked');
                }
            },
            'qualifyingExam': {
                required: true
            },
            'monthOfPassing': {
                required: true
            },
            'yearOfPassing': {
                required: true
            },
            'collegename': {
                required: true
            },
            'collegeplace': {
                required: true
            },
            'schoolmedium2': {
                required: true
            },
            'mainsubject': {
                required: true
            },
            'ancilsubject1': {
                required: true
            },
            'ancilsubject2': {
                required: true
            },
            'ancilsubject3': {
                required: true
            },
            'prgmDuration': {
                required: true
            },
            'terms': {
                required: true
            },
            'numSemesters': {
                required: true
            },
            'university': {
                required: true
            },
            'otherUniversity': {
                required: function (element) {
                    return $('#university').val() == "OTHERS";
                }
            },
            'nametext11': {
                required: true
            },
            'nametext16': {
                required: true
            },
            'nametext20': {
                required: true
            },
            'nametext21': {
                required: true
            },
            'nametext7': {
                required: true
            },
            'dob_month2': {
                required: true
            },
            'dob_year2': {
                required: true
            },
            'nametext12': {
                required: true
            },
            'nametext13': {
                required: true
            },
            'nametext22': {
                required: true,
                max: function () {
                    return parseInt($('#nametext23').val());
                }
            },
            'nametext23': {
                required: true
            },
            'nametext24': {
                required: true,
                max: function () {
                    return parseInt($('#nametext25').val());
                }
            },
            'nametext25': {
                required: true
            },
            'nametext26': {
                required: true,
                max: function () {
                    return parseInt($('#nametext27').val());
                }
            },
            'nametext27': {
                required: true
            },
            'declaration': {
                required: true
            }
        };

        return rules;
    }

    angular.module('ies').factory('regFormValidationMsgs', regFormValidationMsgs);
    function regFormValidationMsgs() {
        var messages = {};
        messages["ugAppForm"] = {
            'fullName': {
                required: 'Applicant name is required'
            },
            // 'nametext2': {
            //     required: 'Middle name is required'
            // },
            // 'lastName': {
            //     required: 'Last name is required'
            // },
            'aadhaarno': {
                required: 'Aadhaar number is required',
                minlength: "Exactly 12 digits required",
                maxlength: "Exactly 12 digits required",
                digits: "Enter valid aadhaar number"
            },
            'dobStr': {
                required: 'DOB is required'
            },
            'dob-day': {
                required: 'Day is required'
            },
            'dob_month': {
                required: 'Month is required'
            },
            'dob_year': {
                required: 'Year is required'
            },
            'gender': {
                required: 'Gender is required'
            },
            'nationality': {
                required: 'Nationality is required'
            },
            'residentialStatus': {
                required: 'Residential Status is required'
            },
            'state': {
                required: 'State is required'
            },
            'relegselect': {
                required: 'Religion is required'
            },
            'castselect': {
                required: 'Caste is required'
            },
            'communityselect': {
                required: 'Community is required'
            },
            'communityIssueselect': {
                required: 'Issued by is required'
            },
            'entercaste': {
                required: 'Caste is required'
            },
            'registerno': {
                required: 'Examination Roll Number is required'
            },
            'schoolmedium': {
                required: 'Medium is required'
            },
            'Ilang10': {
                required: '10th language is required'
            },
            'Ilang12': {
                required: '12th language is required'
            },
            'Ilangc': {
                required: 'Language in college is required'
            },
            'aidedCourse': {
                required: 'Course is required'
            },
            'sfCourse': {
                required: 'Course is required'
            },
            'fathsnametext': {
                required: "Father's name is required"
            },
            'fathsoccuptext': {
                required: "Father's occupation is required"
            },
            'fathmobile': {
                required: "Father's mobile number is required",
                phoneUS: "10 digits required"
            },
            'mothsnametext': {
                required: "Mother's name is required"
            },
            'mothsoccuptext': {
                required: "Mother's occupation is required"
            },
            'mothmobile': {
                required: "Mother's mobile number is required",
                phoneUS: "10 digits required"
            },
            'nativity': {
                required: 'Nativity is required'
            },
            'addrline1text': {
                required: 'Address line1 is required'
            },
            'addrline2text': {
                required: 'Address line2 is required'
            },
            'citytext': {
                required: 'City is required'
            },
            'stateselect': {
                required: 'State is required'
            },
            'pin': {
                required: 'Pincode is required'
            },
            'country': {
                required: 'Country is required'
            },
            'caddrline1text': {
                required: 'Address line1 is required'
            },
            'caddrline2text': {
                required: 'Address line2 is required'
            },
            'ccitytext': {
                required: 'City is required'
            },
            'cstateselect': {
                required: 'State is required'
            },
            'cpin': {
                required: 'Pincode is required'
            },
            'ccountry': {
                required: 'Country is required'
            },
            // 'mobileNumers': {
            //     required: 'Secondary mobile number is required'
            // },
            'emailId': {
                required: 'Email id is required'
            },
            'tamil': {
                required: 'required'
            },
            'dabled': {
                required: 'required'
            },
            'disabledtype': {
                required: 'Type is required'
            },
            'disabledpercent': {
                required: 'Percent is required'
            },
            'disabilityBy': {
                required: 'required'
            },
            'exservice': {
                required: 'required'
            },
            'exservicecadre': {
                required: 'Cadre is required'
            },
            'exservicerankank': {
                required: 'Rank is required'
            },
            'exservicenumber': {
                required: 'Number(ID) is required'
            },
            'exserviceType': {
                required: 'Type is required'
            },
            // 'exserviceAwards': {
            //     required: 'Award is required'
            // },
            'ncc': {
                required: 'required'
            },
            'rdc': {
                required: 'required'
            },
            'nccAchievement': {
                required: 'required'
            },
            'sports': {
                required: 'required'
            },
            'sportsname': {
                required: 'Sport name is required'
            },
            'sportlevel': {
                required: 'Sport level is required'
            },
            'sportDetail': {
                required: 'Achievement detail is required'
            },

            'sportsname1': {
                required: 'Sport name is required'
            },
            'sportlevel1': {
                required: 'Sport level is required'
            },
            'sportDetail1': {
                required: 'Achievement detail is required'
            },
            'sportsname2': {
                required: 'Sport name is required'
            },
            'sportlevel2': {
                required: 'Sport level is required'
            },
            'sportDetail2': {
                required: 'Achievement detail is required'
            },
            'sportsname3': {
                required: 'Sport name is required'
            },
            'sportlevel3': {
                required: 'Sport level is required'
            },
            'sportDetail3': {
                required: 'Achievement detail is required'
            },
            'sportsname4': {
                required: 'Sport name is required'
            },
            'sportlevel4': {
                required: 'Sport level is required'
            },
            'sportDetail4': {
                required: 'Achievement detail is required'
            },
            'sportsname5': {
                required: 'Sport name is required'
            },
            'sportlevel5': {
                required: 'Sport level is required'
            },
            'sportDetail5': {
                required: 'Achievement detail is required'
            },

            'schoolname': {
                required: 'School name is required'
            },
            'schoolAddress': {
                required: 'School address is required'
            },
            'schoolplace': {
                required: 'Location of the school is required'
            },
            'schoolboard': {
                required: 'Board is required'
            },
            'schoolboard1': {
                required: 'Board is required'
            },
            'maxmarks': {
                required: 'Max mark is required'
            },
            'schoolnature': {
                required: 'Group Type is required'
            },
            'nametext7': {
                required: 'Subject is required'
            },
            'nametext8': {
                required: 'Mark is required',
                max: 'Not more than max marks',
                min: 'Enter more than zero'
            },
            'dob_month2': {
                required: 'Month is required'
            },
            'dob_year2': {
                required: 'Year is required'
            },
            'nametext11': {
                required: 'Examination Roll Number is required'
            },
            'nametext12': {
                required: 'Subject is required'
            },
            'nametext13': {
                required: 'Mark is required',
                max: 'Not more than max marks',
                min: 'Enter more than zero'
            },
            'dob_month3': {
                required: 'Month is required'
            },
            'dob_year3': {
                required: 'Year is required'
            },
            'nametext16': {
                required: 'Examination Roll Number is required'
            },
            'nametext17': {
                required: 'Subject is required'
            },
            'nametext18': {
                required: 'Mark is required',
                max: 'Not more than max marks',
                min: 'Enter more than zero'
            },
            'dob_month4': {
                required: 'Month is required'
            },
            'dob_year4': {
                required: 'Year is required'
            },
            'nametext21': {
                required: 'Examination Roll Number is required'
            },
            'nametext22': {
                required: 'Subject is required'
            },
            'nametext23': {
                required: 'Mark is required',
                max: 'Not more than max marks',
                min: 'Enter more than zero'
            },
            'dob_month5': {
                required: 'Month is required'
            },
            'dob_year5': {
                required: 'Year is required'
            },
            'nametext26': {
                required: 'Examination Roll Number is required'
            },
            'nametext27': {
                required: 'Subject is required'
            },
            'nametext28': {
                required: 'Mark is required',
                max: 'Not more than max marks',
                min: 'Enter more than zero'
            },
            'dob_month6': {
                required: 'Month is required'
            },
            'dob_year6': {
                required: 'Year is required'
            },
            'nametext31': {
                required: 'Examination Roll Number is required'
            },
            'nametext33': {
                required: 'Mark is required',
                max: 'Not more than max marks',
                min: 'Enter more than zero'
            },
            'dob_month7': {
                required: 'Month is required'
            },
            'dob_year7': {
                required: 'Year is required'
            },
            'nametext36': {
                required: 'Examination Roll Number is required'
            },
            'declaration': {
                required: 'You must agree before submitting'
            }
        };
        messages["pgAppForm"] = {
            'fullName': {
                required: 'Applicant name is required'
            },
            // 'nametext2': {
            //     required: 'Middle name is required'
            // },
            // 'lastName': {
            //     required: 'Last name is required'
            // },
            'aadhaarno': {
                required: 'Aadhaar number is required',
                minlength: "Exactly 12 digits required",
                maxlength: "Exactly 12 digits required",
                digits: "Enter valid aadhaar number"
            },
            'dobStr': {
                required: 'DOB is required'
            },
            'dob-day': {
                required: 'Day is required'
            },
            'dob_month': {
                required: 'Month is required'
            },
            'dob_year': {
                required: 'Year is required'
            },
            'gender': {
                required: 'Gender is required'
            },
            'nationality': {
                required: 'Nationality is required'
            },
            'residentialStatus': {
                required: 'Residential Status is required'
            },
            'state': {
                required: 'State is required'
            },
            'relegselect': {
                required: 'Religion is required'
            },
            'castselect': {
                required: 'Caste is required'
            },
            'communityselect': {
                required: 'Community is required'
            },
            'communityIssueselect': {
                required: 'Issued by is required'
            },
            'entercaste': {
                required: 'Caste is required'
            },
            'registerno': {
                required: 'Examination Roll Number is required'
            },
            'schoolmedium': {
                required: 'Medium is required'
            },
            'Ilang10': {
                required: '10th language is required'
            },
            'Ilang12': {
                required: '12th language is required'
            },
            'Ilangc': {
                required: 'Language in college is required'
            },
            'aidedCourse': {
                required: 'Course is required'
            },
            'sfCourse': {
                required: 'Course is required'
            },
            'fathsnametext': {
                required: "Father's name is required"
            },
            'fathsoccuptext': {
                required: "Father's occupation is required"
            },
            'fathmobile': {
                required: "Father's mobile number is required",
                phoneUS: "10 digits required"
            },
            'mothsnametext': {
                required: "Mother's name is required"
            },
            'mothsoccuptext': {
                required: "Mother's occupation is required"
            },
            'mothmobile': {
                required: "Mother's mobile number is required",
                phoneUS: "10 digits required"
            },
            'nativity': {
                required: 'Nativity is required'
            },
            'addrline1text': {
                required: 'Address line1 is required'
            },
            'addrline2text': {
                required: 'Address line2 is required'
            },
            'citytext': {
                required: 'City is required'
            },
            'stateselect': {
                required: 'State is required'
            },
            'pin': {
                required: 'Pincode is required'
            },
            'country': {
                required: 'Country is required'
            },
            'caddrline1text': {
                required: 'Address line1 is required'
            },
            'caddrline2text': {
                required: 'Address line2 is required'
            },
            'ccitytext': {
                required: 'City is required'
            },
            'cstateselect': {
                required: 'State is required'
            },
            'cpin': {
                required: 'Pincode is required'
            },
            'ccountry': {
                required: 'Country is required'
            },
            // 'mobileNumers': {
            //     required: 'Secondary mobile number is required'
            // },
            'emailId': {
                required: 'Email id is required'
            },
            'tamil': {
                required: 'required'
            },
            'dabled': {
                required: 'required'
            },
            'disabledtype': {
                required: 'Type is required'
            },
            'disabledpercent': {
                required: 'Percent is required'
            },
            'disabilityBy': {
                required: 'required'
            },
            'exservice': {
                required: 'required'
            },
            'exservicecadre': {
                required: 'Cadre is required'
            },
            'exservicerankank': {
                required: 'Rank is required'
            },
            'exservicenumber': {
                required: 'Number(ID) is required'
            },
            'exserviceType': {
                required: 'Type is required'
            },
            // 'exserviceAwards': {
            //     required: 'Award is required'
            // },
            'ncc': {
                required: 'required'
            },
            'rdc': {
                required: 'required'
            },
            'nccAchievement': {
                required: 'required'
            },
            'sports': {
                required: 'required'
            },
            'sportsname': {
                required: 'Sport name is required'
            },
            'sportlevel': {
                required: 'Sport level is required'
            },
            'sportDetail': {
                required: 'Achievement detail is required'
            },
            'sportsname1': {
                required: 'Sport name is required'
            },
            'sportlevel1': {
                required: 'Sport level is required'
            },
            'sportDetail1': {
                required: 'Achievement detail is required'
            },
            'sportsname2': {
                required: 'Sport name is required'
            },
            'sportlevel2': {
                required: 'Sport level is required'
            },
            'sportDetail2': {
                required: 'Achievement detail is required'
            },
            'sportsname3': {
                required: 'Sport name is required'
            },
            'sportlevel3': {
                required: 'Sport level is required'
            },
            'sportDetail3': {
                required: 'Achievement detail is required'
            },
            'sportsname4': {
                required: 'Sport name is required'
            },
            'sportlevel4': {
                required: 'Sport level is required'
            },
            'sportDetail4': {
                required: 'Achievement detail is required'
            },
            'sportsname5': {
                required: 'Sport name is required'
            },
            'sportlevel5': {
                required: 'Sport level is required'
            },
            'sportDetail5': {
                required: 'Achievement detail is required'
            },
            'qualifyingexam': {
                required: 'Qualification is required'
            },
            'monthOfPassing': {
                required: 'Month is required'
            },
            'yearOfPassing': {
                required: 'Year is required'
            },
            'collegename': {
                required: 'College name is required'
            },
            'collegeplace': {
                required: 'Place of college is required'
            },
            'schoolmedium2': {
                required: 'Medium is required'
            },
            'mainsubject': {
                required: 'Major/Branch is required'
            },
            'ancilsubject1': {
                required: 'Subject1 is required'
            },
            'ancilsubject2': {
                required: 'Subject2 is required'
            },
            'ancilsubject3': {
                required: 'Subject3 is required'
            },
            'prgmDuration': {
                required: 'Program duration is required'
            },
            'terms': {
                required: "Terms are required"
            },
            'numSemesters': {
                required: 'No.of semester is required'
            },
            'university': {
                required: 'University name is required'
            },
            'otherUniversity': {
                required: 'University name is required'
            },
            'nametext11': {
                required: 'Percentage is required'
            },
            'nametext16': {
                required: 'Percentage is required'
            },
            'nametext21': {
                required: 'Percentage is required'
            },
            'nametext7': {
                required: 'Subject is required'
            },
            'dob_month2': {
                required: 'required'
            },
            'dob_year2': {
                required: 'required'
            },
            'nametext12': {
                required: 'required'
            },
            'nametext13': {
                required: 'required'
            },
            'nametext22': {
                required: 'required',
                max: 'Not more than max marks'
            },
            'nametext23': {
                required: 'required'
            },
            'nametext24': {
                required: 'required',
                max: 'Not more than max marks'
            },
            'nametext25': {
                required: 'required'
            },
            'nametext26': {
                required: 'required',
                max: 'Not more than max marks'
            },
            'declaration': {
                required: 'You must agree before submitting'
            }
        };

        return messages;
    }

})();
;
angular.module('ies').controller('enquiryStatusCtrl', enquiryStatusCtrl);
enquiryStatusCtrl.$inject = ['$scope', '$rootScope', '$timeout', '$state', '$window', 'applicantService',
    'commonService', 'manageEnrollmentService', 'reportsService', 's3'];

function enquiryStatusCtrl($scope, $rootScope, $timeout, $state, $window, applicantService, commonService, manageEnrollmentService, reportsService, s3) {

    if (!$rootScope.currentApplicant) {
        //prompt user to login
        $state.go('ies.enquiry.login');
        return;
    }

    $scope.applicant = $rootScope.currentApplicant;
    $rootScope.previewPageLoader = false;
    $scope.needsCorrectionSections = [];

    $timeout(function () {
        $('[data-toggle="popover"]').popover();
    }, 1000)

    $scope.getEnquiryStatus($rootScope.currentApplicant);

    function setDisplayPicture(displayPicture) {
        s3.getDownloadUrl(displayPicture, function (err, res) {
            if (res && res.signedUrl) {
                $scope.displayPictureUrl = new URL(res.signedUrl);
            } else {
                $scope.displayPictureUrl = "assets/images/blank-photo.jpg";
                return;
            }
        });
    }

    $timeout(function () {
        setDisplayPicture($scope.currentApplicant.personalInfo.profilePic);
    }, 500)

    $scope.printApplicant = function () {
        document.querySelector("#preference-body table").classList.add("not-responsive");
        document.querySelector("#academic-body table").classList.add("not-responsive");
        var innerContents = document.getElementById('applicantPrint').innerHTML;
        var popupWinindow = window.open('_blank', 'scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        popupWinindow.document.write('<html><head><link rel="stylesheet" id="css-bootstrap" href="bower_components/bootstrap/dist/css/bootstrap.min.css" /> <link rel="stylesheet" type="text/css" href="../assets/css/print.css" /><link rel="stylesheet" type="text/css" href="../css/style.css" /><link rel="stylesheet" type="text/css" href="../css/main.css" /></head>');
        popupWinindow.document.write('<body onload="window.print()">');
        popupWinindow.document.write(innerContents);
        popupWinindow.document.write('</html>');
        popupWinindow.document.close();
    }

    $scope.checkIfNeedsCorrection = function () {
        var sectionNameMap = {
            "generalInfo": "Personal Details / Community Details",
            "eduInfo": "Academic Details"
        };
        if ($scope.applicant && $scope.applicant.verificationStatus && $scope.applicant.verificationStatus.sectionStatus) {
            var sectionStatus = $scope.applicant.verificationStatus.sectionStatus;
            $scope.needsCorrectionSections = [];
            for (var key in sectionStatus) {
                if (sectionStatus[key] == $rootScope.verificationStatus.NeedsCorrection) {
                    $scope.needsCorrectionSections.push(sectionNameMap[key]);
                }
            };
            if ($scope.needsCorrectionSections.length) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    $scope.admSummary = {};
    function isApplnEnrolled() {
        $scope.admSummary = {};
        $rootScope.previewPageLoader = true;
        manageEnrollmentService.getAdmSummary($scope.applicant.applicantNo, function (err, resp) {
            $rootScope.previewPageLoader = false;
            if (err) {
                $scope.errorMsgContent = "Server Error! Please try again later.";
                return;
            }
            $scope.admSummary = resp;
        });
    }

    isApplnEnrolled();

    function createFileName(prefix, ext) {
        return prefix + "-" + moment(new Date()).format('DD-MM-YYYY-HH-mm') + ext;
    }

    // $scope.enrollmentPdf = function () {
    //     $rootScope.previewPageLoader = true;
    //     reportsService.getEnrollmentPdf($scope.applicant.applicantNo, function (err, resp) {
    //         $rootScope.previewPageLoader = false;
    //         if (!err) {
    //             const blob = new Blob([resp], {
    //                 type: 'application/pdf'
    //             });
    //             commonService.saveBlob(blob, createFileName("Enrollment", ".pdf"));
    //         } else if (err && err.data && err.data.message) {
    //             $scope.errorMsgContent = err.data.message;
    //             return;
    //         } else {
    //             $scope.errorMsgContent = "Failed to download enrollment pdf";
    //             return;
    //         }
    //     });
    // }

    applicantService.getVerificationStatusEnums(function (err, enums) {
        if (err) {
            $scope.errorMsgContent = "Server Error! Please try again later.";
            return commonService.showErrorMessage($scope, "errorMsg", "errorMsgContent", err);
        }
        $rootScope.overallStatus = enums.overallStatus;
        $rootScope.overallStatusDescriptions = enums.overallStatus.descriptions;
        $rootScope.verificationStatus = enums.sectionStatus;
        $rootScope.verificationStatusDescriptions = enums.sectionStatus.descriptions;
        $rootScope.isNeedsCorrection = $scope.checkIfNeedsCorrection();
    });

    function isMarkUpdationPending() {
        if (!$scope.applicant || !$scope.applicant.eduInfo || !$scope.applicant.regDate) {
            $scope.markUpdationPending = true;
        } else {
            $scope.markUpdationPending = false;
        }
    }

    isMarkUpdationPending();

    $scope.showCVMessage = function () {
        if ($scope.applicant && $scope.applicant.verificationStatus) {
            if ($scope.applicant.verificationStatus.overallStatus == $rootScope.overallStatus.Verified) {
                $scope.applicantOVStatus = "Your enquiry form has been verified successfully..!";
            } else if ($scope.applicant.verificationStatus.overallStatus == $rootScope.overallStatus.ConditionallyVerified) {
                $scope.applicantOVStatus = "Your enquiry form has been verified conditionally";
            } else {
                $scope.applicantOVStatus = "The enquiry form verification is in progress..!";
            }
        }
    }

    $scope.showCVMessage();

    $scope.enter12thMarks = function () {
        $rootScope.markEntryMode = true;
        $state.go('ies.enquiry.markEntry');
    }

    $scope.edit = function () {
        $rootScope.markEntryMode = false;
        $state.go('ies.enquiry.form');
    }

    $scope.editPreference = function () {
        $rootScope.markEntryMode = false;
        $rootScope.editPreferenceMode = true;
        $state.go('ies.enquiry.form');
    }

};
(function () {
    'use strict';
    var module = angular.module('ies');
    module.controller('mainController', mainController);
    module.controller('languageController', languageController);

    mainController.$inject = ['$scope', '$rootScope', '$translate', '$timeout', '$interval', '$state',
        '$stateParams', '$window', 'applicantService', 'signupService', 'Idle', '$http'];
    function mainController($scope, $rootScope, $translate, $timeout, $interval, $state, $stateParams, $window, applicantService, signupService, Idle, $http) {
        $rootScope.currentApplicant = null;
        $scope.pageLoader = true;
        $scope.logout = function () {
            if ($state.current.name != 'ies.enquiry.login') {
                logoutApplicantUserSession($rootScope.currentApplicant.contactNo);
            }

            removeUserSession();
            getConfig(false);
            $state.go('ies.enquiry.login');
        };
        getLookUps();
        getConfig(true);
        //Current Year for footer
        $scope.footerCurrentYear = new Date().getFullYear();

        const windowWidth = $(window).width();
        $(document).on('click', '.navbar-collapse.megamenu-collapse a', function () {
            if (windowWidth < 1000) {
                $('.navbar-collapse.megamenu-collapse').removeClass('show');
            }
        })

        history.pushState(null, null, window.location.href);
        history.back();
        window.onpopstate = function () { history.forward(); }

        applicantService.getVerificationStatusEnums(function (err, enums) {
            if (err) {
                showMessage("Server Error! Please try again later or contact Laudea support team.")
            } else if (!err && enums) {
                $rootScope.overallStatus = enums.overallStatus;
                $rootScope.overallStatusDescriptions = enums.overallStatus.descriptions;
                $rootScope.verificationStatus = enums.sectionStatus;
                $rootScope.verificationStatusDescriptions = enums.sectionStatus.descriptions;
            }
        });

        applicantService.getLookUps(function (err, res) {
            $rootScope.dataLookup = res || [];
        });

        function removeUserSession() {
            $rootScope.currentApplicant = null;
            $window.sessionStorage.removeItem("laudea-admission-app");
            $window.sessionStorage.removeItem("currentState");
        }

        function logoutApplicantUserSession() {
            applicantService.logoutApplicantSession($rootScope.currentApplicant.contactNo, function (err, res) {
                if (!err) {
                    clearApplicantUserSession();
                }
            });
        }

        function clearApplicantUserSession() {
            sessionStorage.clear();
            $rootScope.applicantDetails = undefined;
            $http.defaults.headers.common['ApplicantAuthorization'] = undefined;
        }

        var refreshTokenIntervalInMs = 4 * 60 * 1000;
        setInterval(function () {
            validateSessionTokenForApplicant();
        }, refreshTokenIntervalInMs);

        function validateSessionTokenForApplicant() {
            var sessionToken = sessionStorage.getItem("applicantAccessToken");
            if (!sessionToken) {
                clearApplicantUserSession();
                $state.go('ies.enquiry.login');
                return;
            }

            var applicantDetails = JSON.parse(sessionStorage.getItem("applicantDetails"));
            $rootScope.applicantDetails = applicantDetails;
            $http.defaults.headers.common['ApplicantAuthorization'] = sessionToken;
            applicantService.refreshSessionTokenForApplicant($rootScope.applicantDetails.contactNo, function (err, response) {
                if (err) {
                    clearApplicantUserSession();
                    $state.go('ies.enquiry.login');
                }
                else {
                    setApplicantUserSessionAfterRefresh(response.tokenDetails.token);
                }
            });
        }

        function setApplicantUserSessionAfterRefresh(accessToken) {
            sessionStorage.setItem("applicantAccessToken", accessToken);
            $http.defaults.headers.common['ApplicantAuthorization'] = accessToken;
        }

        function getConfig(loadSession) {
            applicantService.getConfigDetails(function (err, res) {
                if (res && res.basicConfig) {
                    $rootScope.basicConfig = res.basicConfig;
                    $rootScope.privacyPolicyUrl = $rootScope.basicConfig.privacyPolicyUrl;
                }
                $rootScope.skipFileUploadInS3 = res.skipFileUploadInS3 ? res.skipFileUploadInS3 : null;
                if (loadSession) {
                    $timeout(function () {
                        loadUserSession();
                    }, 250)
                }
            })
        }

        function getLookUps() {
            applicantService.getLookUps(function (err, res) {
                if (res && Object.keys(res).length) {
                    $rootScope.religions = res.religions;
                    $rootScope.communities = res.communities;
                    $rootScope.commuCertIssuedBy = res.communityCertIssuedBy;
                    $rootScope.nativity = res.nativity;
                    $rootScope.genders = res.genders;
                    $rootScope.transports = res.transports;
                    $rootScope.languages = res.languages;
                    $rootScope.occupations = res.occupations;
                    $rootScope.nationality = res.nationality;
                    $rootScope.residentialStatus = res.residentialStatus;
                    $rootScope.states = res.states;
                    $rootScope.countries = res.countries;
                    $rootScope.castes = res.caste;
                    $rootScope.districts = res.districts;
                    $rootScope.schoolDistricts = Array.from(res.districts);
                    $rootScope.schools = res.schools;
                    $rootScope.months = res.months;
                    $rootScope.schoolStates = res.states;
                    $rootScope.schoolCountries = res.countries;
                    $rootScope.instructionMediums = res.instructionMediums;
                    $rootScope.schoolType = res.schoolType;
                    $rootScope.hseBoards = res.hseBoards;
                    $rootScope.hseNatures = res.hseNatures;
                    $rootScope.mainSubjects = res.mainSubjects;
                }
            });
        }
        $rootScope.$on('$stateChangeSuccess', function () {
            $window.sessionStorage.setItem("currentState", $state.current.name);
        })
        function loadUserSession() {
            var session = $window.sessionStorage.getItem("laudea-admission-app");
            var stateStoredInSession = $window.sessionStorage.getItem("currentState");

            if (!session) {
                $scope.pageLoader = false;
                //on initial visit to the site and upon reloads on page
                $state.go('ies.enquiry.login');
                return;
            }

            var user = JSON.parse(session);
            signupService.login(user, function (err, response) {
                $scope.pageLoader = false;

                if (!err) {
                    $timeout(function () {
                        $rootScope.currentApplicant = response.applicantDetails;

                        $window.sessionStorage.setItem("laudea-admission-app", JSON.stringify({
                            contactNo: response.applicantDetails.contactNo,
                            email: response.applicantDetails.personalInfo.email,
                            password: user.password
                        }));
                        signupService.setUserSessionInBrowserForApplicant(response.tokenDetails, function (error, res) {
                            if (!error) {
                                $rootScope.tokenDetails = res;
                                $scope.getEnquiryStatus($rootScope.currentApplicant);
                            }
                        });
                    }, 0);
                }
                else {
                    $state.go('ies.enquiry.login');
                }
            });
        }

        $scope.getEnquiryStatus = function (currentApplicant) {

            if (currentApplicant) {
                if (currentApplicant.status == "SD") {
                    $state.go('ies.enquiry.status');
                    return;
                }
                else if (currentApplicant.status == 'AV') {
                    $state.go('ies.enquiry.preview');
                    return;
                } else {
                    $state.go('ies.enquiry.form');
                    return;
                }
            }
            else {
                $state.go('ies.enquiry.login');
                return;
            }
        }

        Idle.watch();
        //logged out when ideled.
        $scope.$on('IdleTimeout', function () {
            $scope.logout();
        });

    }


    languageController.$inject = ['$scope', '$translate'];
    function languageController($scope, $translate) {
        var vm = this;
        $scope.change = change;
        function change(l) {
            $translate.use(l);
        }
        vm.languages = [
            {
                'name': 'En',
                'value': 'en',
                'icon': 'flag'
            }, {
                'name': 'Ta',
                'value': 'ta',
                'icon': 'flag'
            }
        ];
    }
})();;
(function () {
    'use strict';
    //page loading animation
    var module = angular.module('ies');
    //sidebar activator
    module.directive('current', current);
    module.directive('topBarCurrent', topBarCurrent);
    //navigation
    module.directive('navBar', navBar);
    module.directive('topBar', topBar);
    module.directive('sideBar', sideBar);
    module.directive('footer', footer);
    module.directive("sideberOutsite", sideberOutsite);
    module.directive('formControl', formControl);

    formControl.$inject = ['$http'];
    function formControl($http) {
        var FOCUS_CLASS = 'input-focused';
        return {
            restrict: 'C',
            link: function (scope, element, attrs, ctrl) {
                element.bind('focus', function () {
                    element.parent().closest('.custom-input').addClass('field-focus')
                    element.parent().addClass(FOCUS_CLASS);
                }).bind('blur', function () {
                    element.parent().closest('.custom-input').removeClass('field-focus')
                });
            }
        };

    }

    navBar.$inject = ['$rootScope', '$compile'];
    function navBar($rootScope, $compile) {
        return {
            restrict: 'EA',
            templateUrl: 'app/modules/navigation/navbar.html',
            replace: true,
            controller: 'languageController',
            link: function (scope, element) {
                $compile(element.contents())($rootScope);
                angular.element('.notif-btn').dropdown({
                    inDuration: 300,
                    outDuration: 225,
                    constrain_width: false, // Does not change width of dropdown to that of the activator
                    hover: true, // Activate on hover
                    gutter: 0, // Spacing from edge
                    belowOrigin: true, // Displays dropdown below the button
                    alignment: 'right' // Displays dropdown with edge aligned to the left of button
                }
                );
                angular.element('.collapsible').collapsible();
                // autocomplete simulation
            }
        };
    }
    topBar.$inject = ['$rootScope', '$compile'];
    function topBar($rootScope, $compile) {
        return {
            restrict: 'EA',
            templateUrl: 'app/modules/navigation/topbar.html',
            replace: true,
            link: function (scope, element) {
                $rootScope.navigationStyle = ThemeSettings.getCookie('navigation-style');
                scope.$watch('navigationStyle', function () {
                    if (scope.navigationStyle == 'horizontal') {
                        element.css('display', 'block');
                    } else {
                        element.css('display', 'none');
                    }
                });
                $compile(element.contents())($rootScope);
                angular.element('.dropdown-button').dropdown({
                    inDuration: 300,
                    outDuration: 225,
                    constrain_width: false, // Does not change width of dropdown to that of the activator
                    hover: true, // Activate on hover
                    gutter: 0, // Spacing from edge
                    belowOrigin: true, // Displays dropdown below the button
                    alignment: 'right' // Displays dropdown with edge aligned to the left of button
                });
                angular.element('.collapsible').collapsible();
            }
        }
    }
    sideBar.$inject = ['$rootScope', '$compile'];
    function sideBar($rootScope, $compile) {
        return {
            restrict: 'EA',
            templateUrl: 'app/modules/navigation/sidebar.html',
            replace: true,
            link: function (scope, element) {
                $rootScope.navigationStyle = ThemeSettings.getCookie('navigation-style');
                scope.$watch('navigationStyle', function () {
                    if (scope.navigationStyle != 'horizontal') {
                        element.find('ul.side-nav').css('transform', '');
                    } else {
                        element.find('ul.side-nav').css('transform', 'translateX(-100%)');
                    }
                });
                $rootScope.readingDirection = ThemeSettings.getCookie('reading-direction');
                scope.$watch('readingDirection', function () {
                    if (scope.readingDirection != 'ltr') {
                        element.find('>ul').removeClass('left-aligned right-aligned').addClass('right-aligned');
                    } else {
                        element.find('>ul').removeClass('left-aligned right-aligned').addClass('left-aligned');
                    }
                });
                $compile(element.contents())($rootScope);
                angular.element('.button-collapse').sideNav({
                    menuWidth: 240, // Default is 240
                    edge: typeof ThemeSettings != "undefined" && ThemeSettings.getCookie('reading-direction') == 'rtl' ? 'right' : 'left', // Choose the horizontal origin
                    closeOnClick: false // Closes side-nav on <a> clicks, useful for Angular/Meteor
                }
                );
            }
        };
    }
    footer.$inject = ['$rootScope', '$compile'];
    function footer($rootScope, $compile) {
        return {
            restrict: 'A',
            templateUrl: 'app/modules/navigation/footer.html',
            replace: true,
            link: function (scope, element) {
                $compile(element.contents())($rootScope);
            }
        };
    }
    current.$inject = ['$state', '$rootScope'];
    function current($state, $rootScope) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var el, li, ul, cb, ch, pli;
                el = element;
                li = el.parent();
                ul = li.parent();
                cb = ul.parent();
                ch = cb.siblings();
                pli = cb.parent();
                var check = function (route) {
                    if (route == attrs.uiSref) {
                        el.addClass('active');
                        li.addClass('active');
                        if (cb.length > 0 && cb[0].localName != 'aside' && angular.element(cb[0]).attr('id') != 'ili') {
                            cb.attr('visit', attrs.uiSref);
                            cb.css('display', 'block');
                        }
                        if (ch.length > 0 && ch[0].localName != 'header') {
                            ch.addClass('active');
                            ch.attr('visit', attrs.uiSref);
                        }
                        if (pli.length > 0 && pli[0].localName != 'div') {
                            pli.addClass('active');
                            pli.attr('visit', attrs.uiSref);
                        }
                    } else {
                        li.removeClass('active');
                        el.removeClass('active');
                        if (cb.attr('visit') == attrs.uiSref && cb.length > 0 && cb[0].localName != 'aside') {
                            // cb.css('display','none');
                        }
                        if (ch.attr('visit') == attrs.uiSref && ch.length > 0 && ch[0].localName != 'header') {
                            ch.removeClass('active');
                        }
                        if (pli.attr('visit') == attrs.uiSref && pli.length > 0 && pli[0].localName != 'div') {
                            pli.removeClass('active');
                        }
                    }
                };
                check($state.current.name);
                $rootScope.$on('$stateChangeStart', function (event, currentRoute, previousRoute) {
                    check(currentRoute.name)
                });

            }
        };
    }
    topBarCurrent.$inject = ['$state', '$rootScope'];
    function topBarCurrent($state, $rootScope) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var el = element;
                var check = function (route) {
                    if (route == attrs.uiSref) {
                        if (el.closest('ul.dropdown-content').length > 0)
                            el.closest('ul.dropdown-content').parent('li').attr('visit', route).addClass('active');
                        el.parent('li').addClass('active');
                    } else {
                        if (el.closest('ul.dropdown-content').length > 0)
                            if (el.closest('ul.dropdown-content').parent('li').attr('visit') != route) {
                                el.closest('ul.dropdown-content').parent('li').attr('visit', '').removeClass('active');
                            }
                        el.parent('li').removeClass('active');
                    }
                };
                check($state.current.name);
                $rootScope.$on('$stateChangeStart', function (event, currentRoute, previousRoute) {
                    check(currentRoute.name)
                });
            }
        };
    }


    //Filter Close when overlay click
    sideberOutsite.$inject = ['$state', '$rootScope'];
    function sideberOutsite($state, $rootScope) {
        return {
            restrict: 'C',
            replace: false,
            priority: 1000,
            link: function link(scope, element, attrs) {
                element.bind("click", function (event) {
                    $('.drawer-close').trigger('click')
                });

            }
        };
    }


})();
;
(function () {
    'use strict';

    angular.module('ies').value("labelTranslation", {
        "english": {
            "personalInformation": "Personal Details",
            "regNo": "12th Examination Roll Number",
            "appName": "Applicant Name (As In 10th Mark Sheet)",
            "aadhaarNo": "Aadhaar No.",
            "dob": "Date of Birth",
            "gender": "Gender",
            "nationality": "Nationality",
            "residentialStatus": "Residential Status",
            "religion": "Religion",
            "convertedChristian": "Are you a Converted Christian?",
            "community": "Community",
            "caste": "Caste",
            "nonListedCaste": "Is your Caste not listed for this community?",
            "listAllCaste": "All Caste List",
            "issuedBy": "Issued by",
            "communityCertificate": "Community Details",
            "contactInformation": "Contact Details",
            "familyInfo": "Parent's Details",
            "fatherName": "Father's Name",
            "fatherContactNumber": "Father's Contact Number",
            "fatherOccupation": "Father's Occupation",
            "motherName": "Mother's Name",
            "motherContactNumber": "Mother's Contact Number",
            "motherOccupation": "Mother's Occupation",
            "addressLine": "Address Line",
            "cityOrVillage": "Name of City (or) Village",
            "country": "Country",
            "state": "State",
            "district": "District",
            "pinCode": "Pin Code",
            "sameAddress": "Is your Permanent address same as contact address?",
            "permanentAddress": "Permanent Address",
            "mobileNumber": "Primary Mobile",
            "emailAddress": "Primary E-mail Address",
            "academicInformation": "Academic Details",
            "schoolName": "Name of the School last studied",
            "otherSchoolName": "Other School Name",
            "placeOfSchool": "Location of the School",
            "natureOfCourse": "Group Type",
            "boardOfExamination": "Board of Examination",
            "appearFor12thExams": "In which year did you first appear for the 12th final board Exams?",
            "totalMarksofIndividualSubject": "Out of Marks of Individual Subject",
            "mainSubject": "Major/Branch",
            "terms": "Terms",
            "durationOfProgram": "Duration of Program (in years)",
            "totalTerms": "Total No. of semesters/academic terms",
            "totalSemesters": "Total No. of semesters",
            "totalYears": "Total No. of years",
            "totalTrimesters": "Total No. of trimesters",
            "otherBoard": "Other Board",
            "marksEntry": "Marks Entry",
            "otherMainSubject": "Other Major/Branch",
            "markAlertMessage": "If you dont have marks now, fill in all the sections other than marks. Your eligibility criteria will be checked based on the subjects that you chosen.",
            "waitingResult": "I am waiting for my results. I would like to choose the subjects alone and complete my registration later.",
            "allResult": "I would like to enter my marks, upload my provisional marksheets and complete my registration",
            "forCbseOtherBoard": "For CBSE and other board students your marks will be automatically normalized to a total of 600 and the cutoff will be calculated for 400.",
            "part": "Part",
            "subject": "Subject",
            "marksSecured": "Marks Secured",
            "maximumMarks": "Marks Out Of",
            "total": "Total",
            "monthYearofPassing": "Month/Year of Passing",
            "noOfAttempts": "No. of Attempts",
            "registerNo": "Examination No.",
            "diplomaAnnouncement1": "If your final exam results are announced, then system will validate all your marks in all semesters. Once validation is successful, you will be allowed to submit your application and complete your registration process. On successful payment, you will receive both application form number and registration number.",
            "diplomaAnnouncement2": "If your final exam results are NOT announced yet, you will still have to enter details of ALL subjects (except marks column) for ALL your semesters INCLUDING THE FINAL semester for which marks are not available. System will validate all the details of all your subjects EXCEPT marks and marksheet copies in all semesters. Once this validation is successful, you will be allowed to submit your application without the final semester marks. You will get your application form number after successfully completing the payment. You application will then be in 'REGISTRATION PENDING' status. When your final marks arrive, please login again and complete the registration by entering all the marks in all the semesters.",
            "diplomaWaitingResult": "My final semester results are announced. I will enter ALL the semester marks secured in UG now and complete registration",
            "diplomaAllResult": "My final semester results are not announced yet. I will enter marks later and complete the registration",
            "marksForSemester": "Marks for Semester",
            "marksForTrimester": "Marks for Trimester",
            "marksForAcademicYear": "Marks for Year",
            "nameOfTheSubject": "Name of the subject",
            "category": "Part",
            "passing": "Passing MM/YYYY",
            "attempts": "Attempts",
            "credits": "Credits",
            "totalMarks": "Total Marks",
            "secured": "Secured",
            "outOf": "Out Of",
            "semester": "Semester",
            "year": "Year",
            "trimester": "Trimester",
            "markSheet": "Marksheet",
            "consolidatedMarksheet": "Consolidated Marksheet",
            "diplomaTotalPercentage": "Total Percentage calculated from the marks entered above automatically",
            "percentageOfMarks": "Percentage of Marks",
            "bankInfoForRefund": "Bank Details for Refund",
            "bankInfoMessage": "If you don't have your own bank account, please provide details of your parent's bank account where you would like to receive the refund if any.",
            "nameOfTheAccountHolder": "Name of the Account Holder",
            "nameOfTheBank": "Name of the Bank",
            "bankIFSCCode": "Bank IFSC Code",
            "bankAccountNumber": "Bank Account Number",
            "confirmAccountNumber": "Confirm Account Number",
            "bankPassbook": "First page of bank passbook",
            "programmeSelection": "Programme Selection",
            "ugApplicationCostMessage": "An Applicant can apply for as many Programmes as they want. Application fee for each Programme will apply during payment. Application fee for each Aided Programme costs Rs.50/- and for Self Financed Programme costs Rs.210/-",
            "pgApplicationCostMessage": "An Applicant can apply for as many Programmes as they want. Application fee for each Programme will apply during payment. Application fee for each Aided Programme costs Rs.60/- and for Self Financed Programme costs Rs.210/-",
            "selectAidedCourses": "Please Select the Aided Programmes you wish to apply for",
            "selectSFCourses": "Please Select the SF Programmes you wish to apply for",
            "iDeclare": "I declare that all the particulars furnished above are true and correct, I submit that I will abide by the rules and regulations of the college , if admitted.",
            "viewEligibilityCriteria": "View Eligibility Criteria for Programmes",
            "passedQualifyingExamination": "Under Graduate Degree",
            "ancillarySubjects": "Ancillary Subjects",
            "registerNumber": "Examination Roll Number",
            "nameOfTheCollege": "Name of the College",
            "addressOfTheCollege": "Address of the College",
            "nameOfTheUniversity": "Name of the University",
            "additionalDetailsforMCA": "Additional Details for MCA",
            "didYouTake": "Have you studied Mathematics in your 10th and +2?",
            "bharathiarInfo": "Bharathiar University students, select existing 'Bharathiar University' entry from the dropdown list correctly to avoid additional other university fees.",
            "pgInfoMessage1": "If your final exam results are announced, then system will validate all your marks in all semesters. Once validation is successful, you will be allowed to submit your application and complete your registration process. On successful payment, you will receive both application form number and registration number.",
            "pgInfoMessage2": "If your final exam results are NOT announced yet, you will still have to enter details of ALL subjects (except marks column) for ALL your semesters INCLUDING THE FINAL semester for which marks are not available. System will validate all the details of all your subjects EXCEPT marks and marksheet copies in all semesters. Once this validation is successful, you will be allowed to submit your application without the final semester marks. You will get your application form number after successfully completing the payment. You application will then be in 'REGISTRATION PENDING' status. When your final marks arrive, please login again and complete the registration by entering all the marks in all the semesters.",
            "pgAnnounced": "My final semester results are announced. I will enter ALL the semester marks secured in UG now and complete registration",
            "pgNotAnnounced": "My final semester results are not announced yet. I will enter marks later and complete the registration",
            "pgMessage": "UG students who don't have their hard copy of their final year semester mark sheet can submit a soft copy of the same mark sheet issued by your college.",
            "ugApplication": "Online Enquiry for B.E/B.Tech Programmes for the Academic Year",
            "pgApplication": "Online Application for Post Graduate Programmes for the Academic Year",
            "provisionalMarksheet": "Provisional Marksheet",
            "nativity": "Nativity",
            "collegeDistrict": "District of the College",
            "collegeState": "State of the college",
            "collegeCountry": "Country of the college",
            "collegePinCode": "Pincode of the college",
            "schoolDistrict": "District of the School",
            "schoolState": "State of the School",
            "schoolCountry": "Country of the school",
            "schoolPinCode": "Pincode of the School",
            "collegeType": "College Type",
            "schoolType": "School Type",
            "mediumInSchool": "Medium of Study in 12th",
            "mediumInUg": "Medium of Study in UG",
            "lateralEnteryStudent": "Are you a lateral entry student?",
            "sportPerson": "Are you a Sportsperson?",
            "sportDisciplinary": "Sports Discipline",
            "sportsOtherDisciplinary": "Other sport Discipline",
            "sportCategory": "Sports Category",
            "sportLevel": "Sports Level",
            "achievementLevel": "Achievement Level",
            "position": "Position of play",
            "ranking": "Ranking",
            "relevantDocuments": "Relevant Documents",
            "relevantDocument": "Relevant Document",
            "exServicePerson": "Are you a ward/wife/widow of an Ex-Service person?",
            "exServicemenCategory": "Ex-Servicemen Category",
            "gallantryAwards": "Gallantry Awards",
            "remarks": "Remarks",
            "physicallyChallenged": "Are you Differently Abled / Physically Challenged?",
            "typeOfDisability": "Type of disability",
            "OtherTypeOfDisability": "Other type of disability",
            "percentageOfDisability": "Percentage of disability",
            "nccPerson": "Are you a NCC cadet?",
            "gradeABC1": "Do you have 'A' certificate with Grade A?",
            "or": 'or',
            "gradeABC2": "'B' Certificate (Only for Sainik School Students) with Grade A?",
            "gradeC": "Do you have 'C' certificate with Grade A?",
            "gradeCDocument": "(Upload C Certificate) only those who possess A grade",
            "youthExchange": "Have you attended Youth Exchange Program?",
            "youParticipated": "In which event you participated",
            "bestCadetAwardSD": "Are you a recipient of Best Cadet Award (SD/SW)? at RDC New Delhi?",
            "bestCadetAwardSDSainik": "Are you an 'All India' Thal / Vayu / Nav sainik camp best cadet?",
            "republicDayCamp": "Have you attended Republic Day Camp held at Delhi",
            "bestCadetAward": "Are you a recipient of Best Cadet Award (JD/JW) at RDC New Delhi.",
            "bestCadetAwardSainik": "Are you an 'All India' Thal / Vayu / Nav sainik camp best cadet?",
            "sainikCamp": "Have you attended Sainik Camp?",
            "specialCategory": "Special Category",
            "provisionalMarksheet": "Provisional Marksheet",
            "nativity": "Nativity",
            "collegeDistrict": "District of the College",
            "collegeState": "State of the college",
            "collegeCountry": "Country of the college",
            "collegePinCode": "Pincode of the college",
            "schoolDistrict": "District of the School",
            "schoolState": "State of the School",
            "schoolCountry": "Country of the school",
            "schoolPinCode": "Pincode of the School",
            "collegeType": "College Type",
            "schoolType": "School Type",
            "mediumInSchool": "Medium of Study in 12th",
            "mediumInUg": "Medium of Study in UG",
            "lateralEnteryStudent": "Are you a lateral entry student?",
            "regNoSSLC": "10th Examination Roll Number",
            "sslcMarkSheet": "10th Marksheet",
            "aadhaarCard": "Aadhaar Card",
            "communityInfo": "Please choose 'Others' if your caste name is not listed.",
            "maleSiblings": "Do you have siblings?",
            "fillAcademicSectionMessage": "In order to select the Programmes, please fill the Academic Details section",
            "attendedLeadershipCamp": "Have you attended leadership camp?",
            "exServicemenMessage": "Please scan and upload all pages of 'Discharge summary book'.",
            "physicallyChallengedMessage": "Please upload only the certificate issued by the government.",
            "preferenceInfo": "Program Preference(s)",
            "jeeMarks": "Do you have a JEE Main 2026 (B.E/B.Tech) score?",
            "jeeYes": "Yes",
            "jeeNo": "No",
            "jeeAppNo": "Application Number",
            "jeeTotalScore": "NTA Total score (percentile)",
            "jeeAir": "AIR based on NTA Score (CRL)",
            "jeeUpload": "Upload the score sheet",
            "eCommunityCertificate": "E-Community Certificate Number",
            "schoolNameIfOther": "If school name is not in the list, please select 'OTHERS'"
        },
        "tamil": {
            "personalInformation": "சுயவிவரங்கள்",
            "regNo": "12-வது/டிப்ளமோ பதிவு  எண்",
            "appName": "விண்ணப்பதாரர்  பெயர்  (10 ஆம் வகுப்பு மதிப்பெண் சான்றிதழில் உள்ளபடி)",
            "aadhaarNo": "ஆதார் எண்.",
            "dob": "பிறந்த தேதி",
            "gender": "பாலினம்",
            "nationality": "தேசியம்",
            "residentialStatus": "குடியிருப்பு நிலை",
            "religion": "மதம்",
            "convertedChristian": "கிறிஸ்துவராக மதம் மாறியவரா?",
            "community": "வகுப்பு",
            "caste": "சாதி உட்பிரிவின் பெயர்",
            "nonListedCaste": "இந்த சமூகத்தில் உங்கள் சாதி பட்டியலிடப்படவில்லையா?",
            "listAllCaste": "அனைத்து சாதி பட்டியல்",
            "issuedBy": "வழங்கப்பட்ட  இடம் /வழங்கிய அரசு",
            "communityCertificate": "சாதி விவரங்கள்",
            "contactInformation": "தொடர்பு கொள்ள வேண்டிய முகவரி",
            "familyInfo": "குடும்ப தகவல்",
            "fatherName": "தந்தையின் பெயர்",
            "fatherContactNumber": "தந்தையின் தொலைபேசி  எண்",
            "fatherOccupation": "தந்தையின் தொழில்",
            "motherName": "தாயின் பெயர்",
            "motherContactNumber": "தாயின் தொலைபேசி  எண்",
            "motherOccupation": "தாயின் தொழில்",
            "addressLine": "முகவரி",
            "cityOrVillage": "நகரம் அல்லது கிராமத்தின் பெயர்",
            "country": "நாடு",
            "state": "மாநிலம்",
            "district": "மாவட்டம்",
            "pinCode": "அஞ்சல் குறியீட்டு எண்",
            "sameAddress": "உங்கள் நிரந்தர முகவரியும் தொடர்பு முகவரியும் ஒன்றா?",
            "permanentAddress": "நிரந்தர முகவரி",
            "mobileNumber": "கைப்பேசி எண்",
            "emailAddress": "மின்னஞ்சல் முகவரி",
            "academicInformation": "கல்வி பயின்ற விவரங்கள்",
            "schoolName": "இறுதியாகப்  படித்த பள்ளியின் பெயர்",
            "placeOfSchool": "பள்ளியின் முகவரி",
            "natureOfCourse": "கல்விப் புலம்",
            "boardOfExamination": "கல்விக் குழுமம்",
            "appearFor12thExams": "முதன்முதலாக 12-ம் வகுப்புப் பொதுத் தேர்வு எழுதப்பட்ட வருடம்?",
            "totalMarksofIndividualSubject": "ஓவ்வொரு பாடத்தின் மொத்த மதிப்பெண்கள்",
            "mainSubject": "முதன்மை பாடம்",
            "terms": "தேர்வுத்திட்டம்",
            "durationOfProgram": "படிப்பிற்கான கால அளவு (வருடங்களில்)",
            "totalTerms": "மொத்தக் கல்விப் பருவங்கள்",
            "totalSemesters": "மொத்தக் கல்விப் பருவங்கள்",
            "totalYears": "மொத்தக் கல்விப் பருவங்கள்",
            "totalTrimesters": "மொத்தக் கல்விப் பருவங்கள்",
            "otherBoard": "பிற கல்விக் குழுமம்",
            "marksEntry": "மதிப்பெண்கள் நுழைவு",
            "otherMainSubject": "துணைமைப் பாடம்",
            "markAlertMessage": "இன்னும் இறுதித் தேர்விற்கான மதிப்பெண்களைப்  பெறவில்லை எனில், மதிப்பெண்களைத் தவிர பிற அனைத்துத்  தகவல்களையும் பூர்த்திசெய்யவும். நீங்கள் தேர்வு செய்த பாடங்களின் அடிப்படையில் உங்களது கல்வித்தகுதி சரிபார்க்கப்படும்.",
            "waitingResult": "எனது தேர்வு முடிவுகளுக்காகக் காத்திருக்கிறேன். தற்பொழுது பாடங்களை மட்டும் தேர்ந்தெடுத்து விட்டு பின்னர் முழுமையாக விண்ணப்பத்தைப்  பதிவு செய்கிறேன்.",
            "allResult": "எனது மதிப்பெண்களைப் பூர்த்தி செய்து, தற்காலிக  மதிப்பெண் சான்றிதழை இணைத்து விண்ணப்பத்தை முழுமையாகப் பதிவு செய்கிறேன்.",
            "forCbseOtherBoard": "CBSE மற்றும் பிற கல்விக்குழுமத்தில் பயின்ற மாணவர்களது மதிப்பெண்கள் தானாகவே, 600-மதிப்பெண்களுக்கு எடுத்துக்கொள்ளப்பட்டு, கட் ஆப் 400-மதிப்பெண்களுக்கு கணக்கிடப்படும்.",
            "part": "பகுதி",
            "subject": "பாடத்தின் பெயர்",
            "marksSecured": "பெற்ற மதிப்பெண்கள்",
            "maximumMarks": "மொத்த மதிப்பெண்கள்",
            "total": "மொத்தம்",
            "monthYearofPassing": "தேர்ச்சி பெற்ற மாதம் / வருடம்",
            "noOfAttempts": "முயற்சிகளின் எண்ணிக்கை",
            "registerNo": "தேர்வு பதிவு எண்",
            "diplomaAnnouncement1": "உங்களது இறுதிப் பருவத் தேர்வு  முடிவுகளைப்   பெற்றிருந்தால்   ,அனைத்துப் பருவங்களிலும் நீங்கள் பெற்ற மதிப்பெண்கள்  யாவும் கணினியின் உதவிகொண்டு சரிபார்க்கப்படும் .வெற்றிகரமாக மதிப்பெண்கள் சரிபார்ப்பு முடித்ததும் ,தங்களது விண்ணப்பத்தைச் சமர்ப்பித்து,முழுமையாகப் பதிவுசெய்ய அனுமதிக்கப்படுவீர்கள். விண்ணப்பக் கட்டணத்தைச் செலுத்தி முடித்ததும் உங்களது விண்ணப்பப் படிவ எண்  மற்றும் பாடப் பதிவு எண்ணைப் பெறலாம்.",
            "diplomaAnnouncement2": "உங்களது  இறுதிப் பருவத் தேர்வு முடிவுகள் இன்னும் வெளியிடப்படவில்லை எனில் மதிப்பெண்கள் கிடைக்காத இறுதிப்பருவம்   உட்பட உங்களது அனைத்துப்  பருவங்களிலும் உள்ள அனைத்துப் பாடங்களின் விவரங்களையும் (மதிப்பெண்கள் தவிர)  பூர்த்தி செய்ய வேண்டும்,  அனைத்துப் பருவங்களிலும் மதிப்பெண்கள் மற்றும்  மதிப்பெண் சான்றிதழ் நகல்களைத் தவிர அனைத்துப்  பாடங்களின் அனைத்து விவரங்களையும் கணினி உதவிகொண்டு சரிபார்க்கப்படும். இந்தச் சரிபார்ப்பு முடிந்தால் இறுதிப் பருவத் தேர்வு மதிப்பெண்கள் இல்லாமல் உங்களது விண்ணப்பத்தைச் சமர்ப்பிக்க  அனுமதிக்கப்படுவீர்கள். விண்ணப்பக் கட்டணத்தைச் செலுத்திய பிறகு, உங்களது விண்ணப்பப் படிவ எண்ணைப் பெறுவீர்கள். உங்கள் விண்ணப்பம்  ‘பதிவு நிலுவையில் உள்ளது’ என்ற நிலையில் இருக்கும். உங்களது இறுதிப் பருவத்திற்கான மதிப்பெண்களைப் பெற்றதும் மீண்டும் உள்நுழைந்து அனைத்து பருவங்களிலும் பெற்ற அனைத்து மதிப்பெண்களையும் பூர்த்தி செய்து உங்களது விண்ணப்பதிவை முழுமையாக நிறைவு செய்யவும்.",
            "diplomaWaitingResult": "எனது இறுதிப் பருவத் தேர்வு முடிவுகள் வெளியிடப்பட்டுவிட்டன. இளங்கலையில்  பெற்ற அனைத்துப் பருவங்களுக்கான மதிப்பெண்களையும் பூர்த்தி செய்து எனது விண்ணப்பத்தை முழுமையாகச் சமர்ப்பிக்கிறேன்.",
            "diplomaAllResult": "எனது இறுதிப் பருவத் தேர்வு முடிவுகள் இன்னும் வெளியிடப்படவில்லை. எனவே, மதிப்பெண்களைப் பின்னர் பூர்த்தி  செய்து எனது விண்ணப்பத்தைச் சமர்ப்பிக்கிறேன்.",
            "marksForSemester": "பருவத்தேர்விற்கான மதிப்பெண்கள்",
            "marksForTrimester": "Marks for Trimester",
            "marksForAcademicYear": "ஆண்டு தேர்விற்கான மதிப்பெண்கள்",
            "nameOfTheSubject": "பாடத்தின் பெயர்",
            "category": "கல்வியின் வகை",
            "passing": "தேர்ச்சி பெற்ற வருடம் MM/YYYY",
            "attempts": "முயற்சிகளின் எண்ணிக்கை",
            "credits": "மதிப்புகள்",
            "totalMarks": "மொத்த மதிப்பெண்கள்",
            "secured": "பெற்ற மதிப்பெண்",
            "outOf": "மொத்த மதிப்பெண்கள்",
            "semester": "பருவம்",
            "year": "ஆண்டு",
            "trimester": "Trimester",
            "markSheet": "மதிப்பெண் சான்றிதழ்",
            "consolidatedMarksheet": "தொகுப்பு மதிப்பெண் சான்றிதழ்",
            "diplomaTotalPercentage": "மொத்த சதவீதம், மேலே நிரப்பப்பட்ட மதிபெண்களிலிருந்து தானாகவே கணக்கிடப்படும்.",
            "percentageOfMarks": "மதிப்பெண்களின் சதவீதம்",
            "bankInfoForRefund": "பணத்தைத் திரும்பப் பெறுவதற்கான வங்கி விவரங்கள்",
            "bankInfoMessage": "உங்களிடம் சொந்த வங்கிக் கணக்கு இல்லையென்றால், உங்கள் பெற்றோரின் வங்கிக் கணக்கு ஏதேனும் இருந்தால், பணத்தைத் திரும்பப் பெற விரும்பும் விவரங்களை வழங்கவும்.",
            "nameOfTheAccountHolder": "வங்கி கணக்கு வைத்திருப்பவரின் பெயர்",
            "nameOfTheBank": "வங்கியின் பெயர்",
            "bankIFSCCode": "வங்கி IFSC குறியீடு",
            "bankAccountNumber": "வங்கி கணக்கு எண்",
            "confirmAccountNumber": "கணக்கு எண்ணை உறுதிப்படுத்தவும்",
            "programmeSelection": "தேர்ந்தெடுக்கும் பாடம்",
            "ugApplicationCostMessage": "ஒரு விண்ணப்பதாரர் எத்தனைப் படிப்புகளுக்கு வேண்டுமானாலும் விண்ணப்பிக்கலாம் .ஒவ்வொரு படிப்புக்கும் தனித்தனியே விண்ணப்பக் கட்டணம் செலுத்தப்பட வேண்டும் .ஒவ்வொரு அரசு உதவிபெறும் பாடப்பிரிவுகளுக்கு  ரூ.50-ம் ஒவ்வொரு சுயநிதிப் பாடப்பிரிவுகளுக்கு ரூ.210-ம் செலுத்தப்படவேண்டும்.",
            "pgApplicationCostMessage": "ஒரு விண்ணப்பதாரர் எத்தனைப் படிப்புகளுக்கு வேண்டுமானாலும் விண்ணப்பிக்கலாம் .ஒவ்வொரு படிப்புக்கும் தனித்தனியே விண்ணப்பக் கட்டணம் செலுத்தப்பட வேண்டும் .ஒவ்வொரு அரசு உதவிபெறும் பாடப்பிரிவுகளுக்கு ரூ.60-ம் ஒவ்வொரு சுயநிதிப் பாடப்பிரிவுகளுக்கு ரூ.210-ம் செலுத்தப்படவேண்டும்.",
            "selectAidedCourses": "அரசு உதவி பெரும் பிரிவில் நீங்கள் விண்ணப்பிக்க விரும்பும் படிப்புகளைத் தேர்ந்தெடுக்கவும்.",
            "selectSFCourses": "சுயநிதிப் பிரிவில் நீங்கள் விண்ணப்பிக்க விரும்பும் படிப்புகளைத் தேர்ந்தெடுக்கவும்.",
            "iDeclare": "மேலே பூர்த்தி செய்யப்பட்ட அனைத்து விவரங்களும் உண்மை மற்றும் சரியானவை என்றும் கல்லூரியில் நான் சேர்க்கப்பட்டால் கல்லூரியின் விதிமுறைகளுக்கு நான் கட்டுப்படுவேன் என்றும் உறுதியளிக்கிறேன்.",
            "viewEligibilityCriteria": "படிப்புகளுக்கான கல்வித் தகுதியைப் பார்க்கவும்.",
            "passedQualifyingExamination": "தேர்ச்சி பெற்ற தேர்வின் பெயர்",
            "ancillarySubjects": "துணைமைப் பாடங்கள்",
            "registerNumber": "தேர்வு பதிவு எண் ",
            "nameOfTheCollege": "இறுதியாகப் படித்த கல்லூரியின் பெயர்",
            "addressOfTheCollege": "இறுதியாகப் படித்த கல்லூரியின் முகவரி",
            "nameOfTheUniversity": "பல்கலைக்கழகத்தின் பெயர்",
            "additionalDetailsforMCA": "MCA க்கான கூடுதல் விவரங்கள்",
            "didYouTake": "நீங்கள் 12வது மற்றும் 10வது வகுப்பில் கணிதம் படித்துள்ளீர்களா?",
            "bharathiarInfo": "பாரதியார் பல்கலைக்கழக மாணவர்கள் பிற பல்கலைக்கழகக் கட்டணங்களைத் தவிர்க்க கீழ்க்காணும் பட்டியலில் ஏற்கனவே உள்ள ‘பாரதியார் பல்கலைக்கழகம்’ என்பதைச்  சரியாகத்  தேர்ந்தெடுக்கவும்.",
            "pgInfoMessage1": "உங்களது இறுதிப் பருவத் தேர்வு  முடிவுகளைப்  பெற்றிருந்தால், அனைத்துப் பருவங்களிலும் நீங்கள் பெற்ற மதிப்பெண்கள்  யாவும் கணினியின் உதவிகொண்டு சரிபார்க்கப்படும்,  மதிப்பெண்கள் சரிபார்ப்பு முடித்ததும், தங்களது விண்ணப்பத்தைச் சமர்ப்பித்து,முழுமையாகப் பதிவுசெய்ய அனுமதிக்கப்படுவீர்கள். விண்ணப்பக் கட்டணத்தைச் செலுத்தி முடித்ததும் உங்களது விண்ணப்பப் படிவ எண்  மற்றும் பாடப் பதிவு எண்ணைப் பெறலாம்.",
            "pgInfoMessage2": "உங்களது  இறுதிப் பருவத் தேர்வு முடிவுகள் இன்னும் வெளியிடப்படவில்லை எனில் மதிப்பெண்கள் கிடைக்காத இறுதிப்பருவம்   உட்பட உங்களது அனைத்துப்  பருவங்களிலும் உள்ள அனைத்துப் பாடங்களின் விவரங்களையும் (மதிப்பெண்கள் தவிர)  பூர்த்தி செய்ய வேண்டும்,  அனைத்துப் பருவங்களிலும் மதிப்பெண்கள் மற்றும்  மதிப்பெண் சான்றிதழ் நகல்களைத் தவிர அனைத்துப்  பாடங்களின் அனைத்து விவரங்களையும் கணினி உதவிகொண்டு சரிபார்க்கப்படும் இந்தச் சரிபார்ப்பு  முடிந்தால் இறுதிப் பருவத் தேர்வு மதிப்பெண்கள் இல்லாமல் உங்களது விண்ணப்பத்தைச் சமர்ப்பிக்க  அனுமதிக்கப்படுவீர்கள். விண்ணப்பக் கட்டணத்தை செலுத்திய பிறகு, உங்களது விண்ணப்பப் படிவ எண்ணைப் பெறுவீர்கள். உங்கள் விண்ணப்பம்  ‘பதிவு நிலுவையில் உள்ளது’ என்ற நிலையில் இருக்கும். உங்களது இறுதிப் பருவத்திற்கான மதிப்பெண்களைப் பெற்றதும் மீண்டும் உள்நுழைந்து அனைத்து பருவங்களிலும் பெற்ற அனைத்து மதிப்பெண்களையும் பூர்த்தி செய்து உங்களது விண்ணப்பதிவை முழுமையாக நிறைவு செய்யவும்.",
            "pgAnnounced": "எனது இறுதிப் பருவத்தேர்வு முடிவுகள் அறிவிக்கப்பட்டுவிட்டன. நான் இப்போது   UG  இல்  பெற்ற அனைத்துப் பருவத்  தேர்வுகளின் மதிப்பெண்களையும் உள்ளீட்டுப் பதிவை முடிக்கிறேன்.",
            "pgNotAnnounced": "எனது இறுதிப் பருவத் தேர்வு முடிவுகள் இன்னும் அறிவிக்கப்படவில்லை. எனவே நான் மதிப்பெண்களை உள்ளீட்டுப் பதிவை பின்னர் முடிக்கிறேன்.",
            "pgMessage": "இறுதியாண்டு, இறுதிப் பருவ அசல் மதிப்பெண் சான்றிதழ் இல்லாத, UG மாணவர்கள் உங்களது கல்லூரியில் வழங்கப்பட்ட இணையவழி மதிப்பெண் பட்டியலை  சமர்ப்பிக்கலாம்.",
            "ugApplication": "இந்தக் கல்வியாண்டின், இளநிலைப்பட்டப் படிப்புகளுக்கான  இணையவழி விண்ணப்பம்",
            "pgApplication": "இந்தக் கல்வியாண்டின், முதுநிலைப்பட்டப் படிப்புகளுக்கான  இணையவழி விண்ணப்பம்",
            "provisionalMarksheet": "தற்காலிக  மதிப்பெண் சான்றிதழ்",
            "nativity": "இருப்பிடம்",
            "collegeDistrict": "இறுதியாகப்  படித்த கல்லூரியின் மாவட்டம்",
            "collegeState": "இறுதியாகப்  படித்த கல்லூரியின் மாநிலம்",
            "collegeCountry": "இறுதியாகப்  படித்த கல்லூரியின் நாடு",
            "collegePinCode": "இறுதியாகப்  படித்த கல்லூரியின் பின்கோடு",
            "schoolDistrict": "பள்ளியின் மாவட்டம்",
            "schoolState": "பள்ளியின் மாநிலம்",
            "schoolCountry": "பள்ளியின் நாடு",
            "schoolPinCode": "பள்ளியின் பின்கோடு",
            "collegeType": "கல்லூரியின் வகை",
            "schoolType": "பள்ளியின் வகை",
            "mediumInSchool": "12ஆம் வகுப்பின் பயிற்றுமொழி",
            "mediumInUg": "இளங்கலையின்  பயிற்றுமொழி",
            "lateralEnteryStudent": "நீங்கள் பக்கவாட்டு நுழைவு மாணவரா?",
            "sportPerson": "நீங்கள் ஒரு சிறந்த விளையாட்டு வீரரா?",
            "sportDisciplinary": "விளையாட்டின் பெயர்",
            "sportCategory": "விளையாட்டின் பிரிவு",
            "sportEvent": "விளையாட்டின் நிகழ்வு அல்லது போட்டி",
            "sportLevel": "விளையாட்டின் நிலை",
            "achievementLevel": "சாதனை நிலை",
            "position": "நிலை",
            "ranking": "தரவரிசை",
            "relevantDocuments": "தொடர்புடைய ஆவணங்கள்",
            "relevantDocument": "தொடர்புடைய ஆவணம்",
            "exServicePerson": "நீங்கள் ஒரு முன்னாள் படைவீரரின் மகன் / மகளா?",
            "exServicemenCategory": "முன்னாள் படைவீரர் பிரிவு",
            "gallantryAwards": "கேலண்ட்ரி விருதுகள்",
            "remarks": "குறிப்புகள்",
            "physicallyChallenged": "நீங்கள் மாற்றுத்திறனாளியா?",
            "typeOfDisability": "குறைபாட்டின் / இயலாமையின் வகை",
            "OtherTypeOfDisability": "மற்ற வகை குறைபாடு ",
            "percentageOfDisability": "குறைபாட்டின் / இயலாமையின் சதவீதம்",
            "nccPerson": "நீங்கள் NCC Cadet?",
            "gradeABC1": "'A' சான்றிதழில் A கிரேடைப் பெற்றுள்ளீர்களா?",
            "or": 'அல்லது',
            "gradeABC2": "'B' சான்றிதழில் A கிரேடைப் பெற்றுள்ளீர்களா (சைனிக் பள்ளி மாணவர்களுக்கு மட்டும்)?",
            "gradeC": "உங்களிடம் கிரேடு A உடன் 'C' சான்றிதழ் உள்ளதா?",
            "gradeCDocument": "A கிரேடு வைத்திருப்பவர்கள் மட்டும்  C சான்றிதழை இணைக்கவும் அல்லது பதிவேற்றவும்.",
            "youthExchange": "நீங்கள் இளைஞர் பரிமாற்ற நிகழ்ச்சியில் கலந்து கொண்டீர்களா?",
            "youParticipated": "எந்த நிகழ்வில் கலந்து கொண்டீர்கள்?",
            "bestCadetAwardSD": "நீங்கள் புது டெல்லியில் நடைபெற்ற RDC முகாமில் சிறந்த கேடட்  விருதைப் (SD /SW ) பெற்றவரா ?",
            "bestCadetAwardSDSainik": "நீங்கள் 'All India' Thal / Vayu / Nav sainik camp best cadet?",
            "republicDayCamp": "புது டெல்லியில் நடைபெற்ற RDC முகாமில் கலந்து கொண்டீர்களா?",
            "bestCadetAward": "நீங்கள் RDC புது டெல்லியில் சிறந்த கேடட் விருதை (JD/JW) பெற்றவரா?",
            "bestCadetAwardSainik": "நீங்கள் 'All India' Thal / Vayu / Nav sainik camp best cadet?",
            "sainikCamp": "நீங்கள் சைனிக் முகாமில் கலந்து கொண்டீர்களா?",
            "specialCategory": "சிறப்புப் பிரிவு",
            "regNoSSLC": "10ஆம் வகுப்பு தேர்வு எண்",
            "sslcMarkSheet": "10ஆம் வகுப்பு மதிப்பெண் சான்றிதழ்",
            "aadhaarCard": "ஆதார் அட்டை",
            "communityInfo": "உங்களது சாதிப்  பெயர் பட்டியலிடப்படவில்லை எனில் ' Others ' என்பதைத் தேர்ந்தெடுக்கவும்",
            "maleSiblings": "உங்களுக்கு உடன்பிறப்புகள் இருக்கிறார்களா?",
            "attendedLeadershipCamp": "தலைமைத்துவ முகாமில் நீங்கள் கலந்து கொண்டீர்களா?",
            "exServicemenMessage": "முன்னாள் படைவீரர்களின் 'Discharge summary' புத்தகத்தின் அனைத்து பக்கங்களையும் ஸ்கேன் செய்து பதிவேற்றவும்.",
            "physicallyChallengedMessage": "அரசு வழங்கிய சான்றிதழை மட்டும் பதிவேற்றவும்.",
            "preferenceInfo": "விருப்பம் / TNEA ஒதுக்கப்பட்ட பாடத்திட்டம்",
            "jeeMarks": "உங்களிடம் JEE Main 2026 (B.E / B.Tech) மதிப்பெண் உள்ளதா?",
            "jeeYes": "ஆம்",
            "jeeNo": "இல்லை",
            "jeeAppNo": "விண்ணப்ப எண்",
            "jeeTotalScore": "என்.டி.ஏ மொத்த மதிப்பெண் (செலவு)",
            "jeeAir": "என்.டி.ஏ ஸ்கோர் (சி.ஆர்.எல்) ஐ அடிப்படையாகக் கொண்ட ஏ.ஐ.ஆர்",
            "jeeUpload": "மதிப்பெண் தாளை பதிவேற்றவும்",
            "eCommunityCertificate": "மின்-சாதிச் சான்றிதழ் எண்",
            "schoolNameIfOther": "பள்ளியின் பெயர் பட்டியலில் இல்லை என்றால், தயவுசெய்து 'OTHERS' என்பதைத் தேர்ந்தெடுக்கவும்"
        }
    });

})();
;
(function () {
  'use strict';

  //controller
  angular.module('ies').controller('loginCtrl', loginCtrl);
  loginCtrl.$inject = ['$scope', '$rootScope', '$timeout', 'signupService', '$state', '$stateParams',
    '$window', 'ValidationService'];

  function loginCtrl($scope, $rootScope, $timeout, signupService, $state, $stateParams,
    $window, ValidationService) {

    $scope.isClosed = false;

    signupService.isClosed(function (err, res) {
      if (!err && res) {
        $scope.isClosed = res.isClosed;
      }
    })

    var loginMobileNo, forgotMobileNo, sigupMobileNo;
    $scope.countryCodePluginFunction = function (contryCode) {
      var mobileNoObject = {
        utilsScript: "assets/js/utils.js",
        separateDialCode: true,
        initialCountry: contryCode,
        onlyCountries: ['in']
      }
      $timeout(function () {
        $scope.input1 = document.querySelector("#monumber");
        $scope.input2 = document.querySelector("#monumberfp");
        $scope.input3 = document.querySelector("#mnumber");

        sigupMobileNo = $scope.input1 ? window.intlTelInput($scope.input1, mobileNoObject) : '';
        forgotMobileNo = $scope.input2 ? window.intlTelInput($scope.input2, mobileNoObject) : '';
        loginMobileNo = $scope.input3 ? window.intlTelInput($scope.input3, mobileNoObject) : '';
      }, 250);
    }
    $scope.countryCodePluginFunction('in');

    $scope.countryCodeReset = function (code) {
      sigupMobileNo.destroy();
      forgotMobileNo.destroy();
      loginMobileNo.destroy();
      $scope.countryCodePluginFunction(code);
    }

    // you can change default debounce globally
    $scope.$validationOptions = { debounce: 750, preValidateFormElements: false, isolatedScope: $scope };

    $scope.recaptcha2Callback = function () {
      $scope.$apply(function () {
        if (grecaptcha.getResponse(recaptcha2) == '') {
          $scope.captcha2_status = 'Please verify captcha.';
        } else {
          $scope.captcha2_status = '';
        }
      });
    };
    addIndianPhoneValidation();

    function addIndianPhoneValidation() {
      jQuery.validator.addMethod('phoneUS', function (phone_number, element) {
        phone_number = phone_number.replace(/\s+/g, '');
        var basicValidation = this.optional(element) || phone_number.length > 9;
        if (phone_number.charAt(0) == "0") {
          //allow all
          return basicValidation;
        } else {
          return basicValidation &&
            phone_number.match(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/);
        }
      }, 'Please enter a valid phone number.');
    }

    $scope.title = "Enquiry Form";
    //    reg.textOnly=/^[a-zA-Z\s]*$/;

    $scope.newUser = {};
    $scope.isPrivacyPolicyDec = 0;
    $scope.user = {};
    $scope.serverError = false;
    $scope.loginSection = true;
    $scope.signupFormSection = false;
    $scope.signupSection = true;
    $scope.verifySection = false;
    $scope.passwordSection = false;
    $scope.emailSection = false;
    $scope.verifyEmailSection = false;
    $scope.forgotPasswordFormSection = false;
    $scope.forgotPasswordSection = false;
    $scope.verifyForgotPasswordSection = false;
    $scope.changePasswordSection = false;
    $scope.timerOn = false;
    $scope.showResendOTP = false;
    $scope.requireOtp = false;
    $scope.privacyPolicyErr = false;

    if ($rootScope.signupEnableToCurrentTab) {
      $scope.loginSection = false;
      $scope.signupFormSection = true;
      $scope.signupSection = true;
      $timeout(function () {
        $rootScope.signupEnableToCurrentTab = false;
      }, 500);
    }

    $timeout(function () {
      $scope.successMsg = false;
      $scope.success = false;
    }, 3000);

    $scope.signupForm = function () {
      $scope.signupFormSection = true;
      $scope.signupSection = true;
      $scope.loginSection = false;
      $scope.verifySection = false;
      $scope.passwordSection = false;
      $scope.emailSection = false;
      $scope.verifyEmailSection = false;
      $scope.forgotPasswordFormSection = false;
    }

    $scope.loginForm = function () {
      $scope.loginSection = true;
      $scope.signupFormSection = false;
      $scope.forgotPasswordFormSection = false;
      $scope.forgotPasswordSection = false;
      $scope.verifyForgotPasswordSection = false;
      $scope.changePasswordSection = false;
      $scope.signupSection = false;
      $scope.verifySection = false;
      $scope.passwordSection = false;
      $scope.emailSection = false;
      $scope.verifyEmailSection = false;
    }

    $scope.forgotPasswordForm = function () {
      var number = $scope.user.contactNo;
      $scope.user = {};
      if (number)
        $scope.user.contactNo = number;
      $scope.countryCodeReset(loginMobileNo.s.iso2);
      $scope.forgotPasswordFormSection = true;
      $scope.forgotPasswordSection = true;
      $scope.signupFormSection = false;
      $scope.loginSection = false;
    }

    $scope.sendOtp = function (resend) {
      if (forgotMobileNo.isValidNumber() || resend) {
        $scope.forgotOtpErrorMsg = false;
        $scope.error = false;
        $scope.success = false;
        $timeout.cancel($scope.timer);
        $scope.showResendOTP = false;
        validation.call(this, false, "#forgotPassword1", rules["forgotPassword"], messages["forgotPassword"], function (error, res) {
          if (!error) {
            $scope.user.status = "forgot password";
            $scope.user.signupUser = true;
            $scope.user.countryCode = forgotMobileNo.s.iso2;
            if (forgotMobileNo.s.iso2 != 'in' && !resend)
              $scope.user.contactNo = '0' + forgotMobileNo.s.dialCode + '' + $scope.user.contactNo;
            signupService.generateOtp($scope.user, $scope.user.contactNo, function (err, response) {
              if (!err) {
                $scope.verifyForgotPasswordSection = true;
                $scope.forgotPasswordSection = false;
                if (resend) {
                  $scope.success = true;
                  $scope.successMsg = "An OTP (One Time Password) has been sent to your mobile number.";
                  $timeout(function () {
                    $scope.success = false;
                  }, 10000);
                }
                delete $scope.user.signupUser;
                countDownTimer(120);
              } else {
                $scope.error = true;
                $scope.errorMsg = (err.data && err.data.message) ? err.data.message : err.statusText;
                $scope.user = {};
                $timeout(function () {
                  $scope.error = false;
                }, 10000);
              }
            });
          }
        });
      } else {
        $scope.forgotOtpErrorMsg = true;
      }
    }

    $scope.verifyOtp = function () {
      $scope.error = false;
      $scope.success = false;
      validation.call(this, false, "#forgotPasswd2", rules["signup2"], messages["signup2"], function (error, res) {
        if (!error) {
          signupService.confirmOtp($scope.user, $scope.user.contactNo, function (err, response) {
            if (!err) {
              $scope.verifyForgotPasswordSection = false;
              $scope.changePasswordSection = true;
              $scope.success = true;
              $scope.user.oldPassword = response.old;
              $scope.successMsg = "You have successfully verified your mobile number.";
              countDownTimer(-1, true);
              $timeout(function () {
                $scope.success = false;
              }, 10000);
            } else {
              $scope.error = true;
              $scope.errorMsg = (err.data && err.data.message) ? err.data.message : err.statusText;
              $timeout(function () {
                $scope.error = false;
              }, 10000);
            }
            delete $scope.newUser.otp;
          });
        }
      });
    }

    function countDownTimerForEmail(remaining, otpVerified) {
      $scope.remainingTime = remaining;
      $scope.stopCount = false;
      if (otpVerified) {
        $timeout.cancel($scope.mailTimer);
        $scope.mailTimerOn = false;
        $scope.stopCount = true;
        remaining = null
        $scope.remainingTime = null;
        return false;
      }
      $scope.mailTimerOn = true;
      var m = Math.floor(remaining / 60);
      var s = remaining % 60;
      m = m < 10 ? '0' + m : m;
      s = s < 10 ? '0' + s : s;
      document.getElementById('mailTimer').innerHTML = m + ':' + s;
      $scope.remainingTime -= 1;
      if ($scope.remainingTime >= 0) {
        $scope.mailTimer = $timeout(function () {
          if (!$scope.stopCount) {
            countDownTimerForEmail($scope.remainingTime);
          }
        }, 1000);
        return;
      }
      else {
        $timeout(function () {
          $scope.mailTimerOn = false;
          $scope.success = false;
          $scope.mailResendOTP = true;
          $scope.error = true;
          $scope.errorMsg = "The (OTP) One Time Password you have entered has expired."
          $timeout(function () {
            $scope.error = false;
          }, 10000);
        }, 200)
      }
    }

    $scope.sendEmailOtp = function () {
      delete $scope.newUser.otp;
      if (new ValidationService().checkFormValidity($scope.signUpEmailForm)) {
        $scope.errorMsgs = "";
        $timeout.cancel($scope.mailTimer);
        $scope.newUser.verifyEmailOtp = false;
        $scope.error = false;
        $scope.success = false;
        $scope.mailResendOTP = false;
        signupService.generateEmailOtp($scope.newUser, function (err, response) {
          if (!err) {
            $scope.success = true;
            $scope.successMsg = "An OTP (One Time Password) has been sent to your Email Id.";
            $timeout(function () {
              $scope.verifyEmailSection = true;
              $scope.emailSection = false;
            }, 500)
            $timeout(function () {
              $scope.success = false;
            }, 10000);
            countDownTimerForEmail(120);
          }
          else {
            $scope.error = true;
            $scope.errorMsg = (err.data && err.data.message) ? err.data.message : err.statusText;
            $timeout(function () {
              $scope.error = false;
            }, 10000);
          }
        });
      }
    };

    $scope.verifyEmailOtp = function () {
      if (new ValidationService().checkFormValidity($scope.emailOtp)) {
        $scope.error = false;
        $scope.success = false;
        signupService.confirmEmailOtp($scope.newUser, function (err, response) {
          if (!err) {
            $scope.newUser.verifyEmailOtp = false;
            countDownTimerForEmail(-1, true);
            $scope.success = true;
            $scope.successMsg = "You have successfully verified your Email Id.";
            $scope.newUser.verifyEmailOtp = true;
            $timeout(function () {
              $scope.verifyEmailSection = false;
              $scope.passwordSection = true;
            }, 500)
            $timeout(function () {
              $scope.success = false;
            }, 10000);

          }
          else {
            $scope.error = true;
            $scope.errorMsg = (err.data && err.data.message) ? err.data.message : err.statusText;
            $timeout(function () {
              $scope.error = false;
            }, 10000);
          }
          delete $scope.newUser.otp;
        });
      }
    }

    $scope.changePassword = function () {
      var passwordChangeRequest = {
        applicant: $scope.user,
        contactNo: $scope.user.contactNo
      };

      //change the password and take the applicant to home page
      signupService.changePassword(passwordChangeRequest, function (err, response) {
        if (err) {
          $scope.serverErrorMsg = (err.data && err.data.message) ? err.data.message : "Internal Server Error";
          return;
        }

        //proceed to application form page
        $rootScope.currentApplicant = response;
        $rootScope.currentApplicant.password = $scope.password;
        $scope.success = false;
        $scope.loginForm();
        $scope.success = true;
        $scope.successMsg = "You have successfully reset your password.";
        $scope.user.password = '';
        $timeout(function () {
          $scope.success = false;
          $scope.successMsg = false
        }, 10000);
      });
    };

    function countDownTimer(remaining, otpVerified) {
      $scope.remainingTime = remaining;
      $scope.stopCount = false;
      if (otpVerified) {
        $timeout.cancel($scope.timer);
        $scope.timerOn = false;
        $scope.stopCount = true;
        remaining = null
        $scope.remainingTime = null;
        return false;
      }
      $scope.timerOn = true;
      var m = Math.floor($scope.remainingTime / 60);
      var s = $scope.remainingTime % 60;
      m = m < 10 ? '0' + m : m;
      s = s < 10 ? '0' + s : s;
      angular.element('.timer').html(m + ':' + s);
      $scope.remainingTime -= 1;
      if ($scope.remainingTime >= 0) {
        $scope.timer = $timeout(function () {
          if (!$scope.stopCount) {
            countDownTimer($scope.remainingTime);
          }
        }, 1000);
        return;
      }
      else {
        $timeout(function () {
          $scope.timerOn = false;
          $scope.success = false;
          $scope.showResendOTP = true;
          $scope.newUser.otp = "";
          $scope.user.otp = "";
          $scope.error = true;
          $scope.errorMsg = "The (OTP) One Time Password you have entered has expired."
          $timeout(function () {
            $scope.error = false;
          }, 10000);
        }, 200)
      }
    }

    $scope.next = function () {
      $scope.privacyPolicyErr = false;
      if (sigupMobileNo.isValidNumber()) {
        $scope.createAccountErrorMsg = false;
        $scope.error = false;
        $scope.success = false;
        $timeout.cancel($scope.timer);
        $scope.showResendOTP = false;
        validation.call(this, false, "#signup1", rules["signup1"], messages["signup1"], function (error, res) {
          if (!error) {

            $scope.newUser.countryCode = sigupMobileNo.s.iso2;
            $scope.countryCodeReset(sigupMobileNo.s.iso2);
            if (sigupMobileNo.s.iso2 != 'in')
              $scope.newUser.contactNo = '0' + sigupMobileNo.s.dialCode + '' + $scope.newUser.contactNo;

            $scope.newUser.signupUser = true;
            if (!$scope.isPrivacyPolicyDec) {
              $scope.privacyPolicyErr = true;
              $timeout(function () {
                $scope.privacyPolicyErr = false;
              }, 10000);
              return;
            }
            $scope.newUser.isPrivacyPolicyDec = true;
            signupService.generateOtp($scope.newUser, $scope.newUser.contactNo, function (err, response) {
              if (!err) {
                $scope.verifySection = true;
                $scope.signupSection = false;
                $scope.success = true;
                $scope.successMsg = "An OTP (One Time Password) has been sent to your mobile number.";
                $timeout(function () {
                  $scope.success = false;
                }, 10000);
                delete $scope.newUser.signupUser;
                countDownTimer(120);
              } else {
                $scope.selectedProgram = false;
                $scope.error = true;
                $scope.errorMsg = (err.data && err.data.message) ? err.data.message : err.statusText;
                $scope.newUser = {};
                $scope.isPrivacyPolicyDec = 0;
                $timeout(function () {
                  $scope.error = false;
                }, 10000);
              }
            });
          }
        });
      } else {
        $scope.createAccountErrorMsg = true;
      }
    }

    $scope.verify = function () {
      $scope.error = false;
      $scope.success = false;
      validation.call(this, false, "#signup2", rules["signup2"], messages["signup2"], function (error, res) {
        if (!error) {
          signupService.confirmOtp($scope.newUser, $scope.newUser.contactNo, function (err, response) {
            if (!err) {
              $scope.verifySection = false;
              $scope.emailSection = true;
              $scope.success = true;
              $scope.successMsg = "You have successfully verified your mobile number.";
              countDownTimer(-1, true);
              $timeout(function () {
                $scope.success = false;
              }, 10000);
            } else {
              $scope.error = true;
              $scope.errorMsg = (err.data && err.data.message) ? err.data.message : err.statusText;
              $timeout(function () {
                $scope.error = false;
              }, 10000);
            }
          });
        }
      });
    }

    $scope.signup = function () {
      //signup with server
      $scope.error = false;
      $scope.success = false;
      validation.call(this, false, "#signup3", rules["signup3"], messages["signup3"], function (error, res) {
        if (!error) {
          if ($scope.newUser.password == $scope.newUser.confirmPassword) {
            signupService.signup($scope.newUser, function (err, response) {
              if (!err) {
                //proceed to application page
                console.log("Signup details successfully saved");
                $scope.newUser = {};
                $scope.isPrivacyPolicyDec = 0;
                $scope.user = {};

                //$rootScope.currentApplicant = response;
                $scope.success = true;
                $scope.successMsg = "You have successfully completed the signup process. Please login to continue.";
                $timeout(function () {
                  $scope.success = false;
                }, 10000);
                $timeout(function () {
                  $scope.passwordSection = false;
                  $scope.loginForm();
                }, 1000);
              } else {
                $scope.error = true;
                $scope.errorMsg = (err.data && err.data.message) ? err.data.message : err.statusText;
                $timeout(function () {
                  $scope.error = false;
                }, 10000);
              }
            });
          }
        }
      });
    };

    $scope.login = function () {
      if (loginMobileNo.isValidNumber()) {
        $scope.loginErrorMsg = false;
        $scope.error = false;
        $scope.success = false;
        validation.call(this, false, "#login1", rules["login"], messages["login"], function (err, res) {
          if (!err) {
            $scope.user.countryCode = loginMobileNo.s.iso2;
            if (loginMobileNo.s.iso2 != 'in')
              $scope.user.contactNo = '0' + loginMobileNo.s.dialCode + '' + $scope.user.contactNo;
            //login to server
            signupService.login($scope.user, function (err, response) {
              if (!err) {
                var title = "PSG - Admissions " + $rootScope.basicConfig.currentYear + " - Online Enquiry";
                $("title").html(title);
                //proceed to verification page
                $timeout(function () {
                  $scope.success = false;
                  $rootScope.currentApplicant = response.applicantDetails;

                  $window.sessionStorage.setItem("laudea-admission-app", JSON.stringify({
                    contactNo: response.applicantDetails.contactNo,
                    email: response.applicantDetails.personalInfo.email,
                    password: $scope.user.password
                  }));
                  signupService.setUserSessionInBrowserForApplicant(response.tokenDetails, function (err, res) {
                    if (!err) {
                      $rootScope.tokenDetails = res;
                      $scope.getEnquiryStatus($rootScope.currentApplicant);
                    }
                  });
                }, 1000);
              } else {
                //stay on the same page while waiting for
                $scope.error = true;
                $scope.errorMsg = (err.data && err.data.message) ? err.data.message : err.statusText;
                $scope.user = {};
                $timeout(function () {
                  $scope.error = false;
                }, 10000);
                return false;
              }
            });
          }
        });
      } else {
        $scope.loginErrorMsg = true;
      }


    };

    var rules = {};
    var messages = {};
    rules["login"] = {
      'password': {
        required: true
      }
    };
    messages["login"] = {
      'password': {
        required: 'Password is required'
      }
    };

    rules["signup1"] = {
      'program': {
        required: true
      }
    };
    messages["signup1"] = {
      'program': {
        required: 'Program is required'
      }
    };

    rules["signup2"] = {
      'otp': {
        required: true
      }
    };
    messages["signup2"] = {
      'otp': {
        required: 'OTP is required'
      }
    };

    rules["signup3"] = {
      'pword': {
        required: true
      },
      'confmpword': {
        required: true,
        equalTo: "#pword"
      }
    };
    messages["signup3"] = {
      'pword': {
        required: 'Password is required'
      },
      'confmpword': {
        required: 'Confirm password is required',
        equalTo: 'Your Passwords Must Match'
      }
    };

    rules["forgotPasswd3"] = {
      'pwordfp': {
        required: true
      },
      'confmpwordfp': {
        required: true,
        equalTo: "#pwordfp"
      }
    };
    messages["forgotPasswd3"] = {
      'pwordfp': {
        required: 'Password is required'
      },
      'confmpwordfp': {
        required: 'Confirm password is required',
        equalTo: 'Your Passwords Must Match'
      }
    };

    var validation = function (onLoad, formId, rules, messages, callback) {
      var contextScope = this;
      contextScope.onLoad = onLoad;
      var validator = $(formId).validate({
        ignore: [],
        errorClass: 'help-block animated fadeInDown',
        errorElement: 'small',
        errorPlacement: function (error, e) {
          if (!contextScope.onLoad) {
            jQuery(e).parents('.form-group > small').append(error);
          }
        },
        highlight: function (e) {
          var elem = jQuery(e);
          if (!contextScope.onLoad) {
            elem.closest('.form-group').removeClass('has-error').addClass('has-error');
            elem.closest('.help-block').remove();
          }
        },
        success: function (e) {
          var elem = jQuery(e);
          elem.closest('.form-group').removeClass('has-error');
          elem.closest('.help-block').remove();
        },
        rules: rules,
        messages: messages
      });
      if (contextScope.onLoad) {
        $(formId).valid();
      } else if ($(formId).valid()) {
        callback(null, validator);
      }
    };
  }

})();;
(function () {
    'use strict';
    //directives
    angular.module('ies').directive('login', login);
    login.$inject = ['$rootScope', '$compile'];

    function login($rootScope, $compile) {
        return {
            restrict: 'EA',
            templateUrl: 'app/modules/login.html',
            replace: true,
            controller: 'loginCtrl',
            link: function (scope, element) {
                $compile(element.contents())($rootScope);
            }
        }
    }

    angular.module('ies').directive('personalInfo', personalInfo);
    personalInfo.$inject = ['$rootScope', '$compile'];

    function personalInfo($rootScope, $compile) {
        return {
            restrict: 'EA',
            templateUrl: 'app/modules/sections/personalInfo.html',
            controller: 'personalInfoCtrl',
            replace: true
        }
    }

    angular.module('ies').directive('communityInfo', communityInfo);
    communityInfo.$inject = ['$rootScope', '$compile'];

    function communityInfo($rootScope, $compile) {
        return {
            restrict: 'EA',
            templateUrl: 'app/modules/sections/communityInfo.html',
            controller: 'communityInfoCtrl',
            replace: true
        }
    }
    angular.module('ies').directive('familyInfo', familyInfo);
    familyInfo.$inject = ['$rootScope', '$compile'];

    function familyInfo($rootScope, $compile) {
        return {
            restrict: 'EA',
            templateUrl: 'app/modules/sections/familyInfo.html',
            controller: 'familyInfoCtrl',
            replace: true
        }
    }

    angular.module('ies').directive('contactInfo', contactInfo);
    contactInfo.$inject = ['$rootScope', '$compile'];

    function contactInfo($rootScope, $compile) {
        return {
            restrict: 'EA',
            templateUrl: 'app/modules/sections/contactInfo.html',
            controller: 'contactInfoCtrl',
            replace: true
        }
    }

    angular.module('ies').directive('academicInfo', academicInfo);
    academicInfo.$inject = ['$rootScope', '$compile'];

    function academicInfo($rootScope, $compile) {
        return {
            restrict: 'EA',
            templateUrl: 'app/modules/sections/academicInfo.html',
            controller: 'academicInfoCtrl',
            replace: true
        }
    }

    angular.module('ies').directive('preferenceInfo', preferenceInfo);
    preferenceInfo.$inject = ['$rootScope', '$compile'];

    function preferenceInfo($rootScope, $compile) {
        return {
            restrict: 'EA',
            templateUrl: 'app/modules/sections/preferenceInfo.html',
            controller: 'preferenceInfoCtrl',
            replace: true
        }
    }

    angular.module('ies').directive('previewForm', previewForm);
    previewForm.$inject = ['$rootScope', '$compile'];

    function previewForm($rootScope, $compile) {
        return {
            restrict: 'EA',
            templateUrl: 'app/modules/previewForm.html',
            replace: true,
            controller: 'previewFormCtrl',
            link: function (scope, element) {
                $compile(element.contents())($rootScope);
            }
        }
    }

    angular.module('ies').directive('previewPersonalInfo', previewPersonalInfo);
    previewPersonalInfo.$inject = ['$rootScope', '$compile'];

    function previewPersonalInfo($rootScope, $compile) {
        return {
            restrict: 'EA',
            templateUrl: 'app/modules/preview/personalInfo.html',
            replace: true
        }
    }

    angular.module('ies').directive('previewBankDetails', previewBankDetails);
    previewBankDetails.$inject = ['$rootScope', '$compile'];

    function previewBankDetails($rootScope, $compile) {
        return {
            restrict: 'EA',
            templateUrl: 'app/modules/preview/bankDetails.html',
            replace: true
        }
    }

    angular.module('ies').directive('bankDetails', bankDetails);
    bankDetails.$inject = ['$rootScope', '$compile'];

    function bankDetails($rootScope, $compile) {
        return {
            restrict: 'EA',
            templateUrl: 'app/modules/sections/bankDetails.html',
            replace: true
        }
    }

    angular.module('ies').directive('previewCommunityInfo', previewCommunityInfo);
    previewCommunityInfo.$inject = ['$rootScope', '$compile'];

    function previewCommunityInfo($rootScope, $compile) {
        return {
            restrict: 'EA',
            templateUrl: 'app/modules/preview/communityInfo.html',
            replace: true
        }
    }
    angular.module('ies').directive('previewFamilyInfo', previewFamilyInfo);
    previewFamilyInfo.$inject = ['$rootScope', '$compile'];

    function previewFamilyInfo($rootScope, $compile) {
        return {
            restrict: 'EA',
            templateUrl: 'app/modules/preview/familyInfo.html',
            replace: true
        }
    }

    angular.module('ies').directive('previewContactInfo', previewContactInfo);
    previewContactInfo.$inject = ['$rootScope', '$compile'];

    function previewContactInfo($rootScope, $compile) {
        return {
            restrict: 'EA',
            templateUrl: 'app/modules/preview/contactInfo.html',
            replace: true
        }
    }

    angular.module('ies').directive('previewAcademicInfo', previewAcademicInfo);
    previewAcademicInfo.$inject = ['$rootScope', '$compile'];

    function previewAcademicInfo($rootScope, $compile) {
        return {
            restrict: 'EA',
            templateUrl: 'app/modules/preview/academicInfo.html',
            replace: true
        }
    }

    angular.module('ies').directive('previewPreferenceInfo', previewPreferenceInfo);
    previewPreferenceInfo.$inject = ['$rootScope', '$compile'];

    function previewPreferenceInfo($rootScope, $compile) {
        return {
            restrict: 'EA',
            templateUrl: 'app/modules/preview/preferenceInfo.html',
            replace: true
        }
    }

    angular.module('ies').directive('enquiryStatus', enquiryStatus);
    enquiryStatus.$inject = ['$rootScope', '$compile'];

    function enquiryStatus($rootScope, $compile) {
        return {
            restrict: 'EA',
            templateUrl: 'app/modules/enquiryStatus.html',
            replace: true,
            controller: 'enquiryStatusCtrl',
            link: function (scope, element) {
                $compile(element.contents())($rootScope);
            }
        }
    }

    angular.module('ies').directive('enquiryForm', enquiryForm);
    enquiryForm.$inject = ['$rootScope', '$compile'];
    function enquiryForm($rootScope, $compile) {
        return {
            restrict: 'EA',
            templateUrl: 'app/modules/enquiryForm.html',
            replace: true,
            controller: 'enquiryFormCtrl'
        }
    }

    angular.module('ies').directive('marksEntry', marksEntry);
    marksEntry.$inject = ['$rootScope', '$compile'];
    function marksEntry($rootScope, $compile) {
        return {
            restrict: 'EA',
            templateUrl: 'app/modules/enquiryForm.html',
            replace: true,
            controller: 'enquiryFormCtrl'
        }
    }

    angular.module('ies').directive('restrictTo', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                if (attrs.type !== "tel") {
                    element.on('cut copy paste', function (event) {
                        event.preventDefault();
                    });
                }
                var re = RegExp(attrs.restrictTo);
                var exclude = /Backspace|Enter|Tab|Delete|Del|ArrowUp|Up|ArrowDown|Down|ArrowLeft|Left|ArrowRight|Right/;
                element[0].addEventListener('keydown', function (event) {
                    if (!exclude.test(event.key) && !re.test(event.key) && !event.ctrlKey) {
                        event.preventDefault();
                    }
                });
            }
        }
    });

    angular.module('ies').directive('restrictToSpaces', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var re = RegExp(attrs.restrictToSpaces);
                element.on('cut copy paste', function (event) {
                    event.preventDefault();
                });
                var exclude = /Backspace|Enter|Tab|Delete|Del|ArrowUp|Up|ArrowDown|Down|ArrowLeft|Left|ArrowRight|Right/; element[0].addEventListener('keydown', function (event) {
                    if (!exclude.test(event.key) && !re.test(event.key)) {
                        event.preventDefault();
                    }
                });
                element.bind('input', function () {
                    $(this).val($(this).val().replace(/  /g, ' '));
                });
            }
        }
    });

    angular.module('ies').directive('allowMinDigit', function () {
        return {
            restrict: 'A',
            link: function (scope, elm, attrs, ctrl) {
                elm.on('input', function (event) {
                    var $input = $(this);
                    var value = $input.val();
                    var match;
                    match = (/(\d{0,3})/g).exec(value.replace(/[^\d.]+/g, ''));
                    value = match[1];
                    $input.val(value);
                });
            }
        }
    });

    angular.module('ies').directive('noCopyPaste', function () {
        return {
            restrict: 'A',
            scope: {},
            link: function (scope, element) {
                element.on('cut copy paste', function (event) {
                    event.preventDefault();
                });
            }
        }
    });

    angular.module('ies').directive('uppercase', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, modelCtrl) {
                modelCtrl.$parsers.push(function (input) {
                    return input ? input.toUpperCase() : "";
                });
                element.css("text-transform", "uppercase");
            }
        };
    })

    angular.module('ies').directive("limitTo", [function () {
        return {
            restrict: "A",
            link: function (scope, elem, attrs) {
                var limit = parseInt(attrs.limitTo);
                angular.element(elem).on("keypress", function (e) {
                    if (this.value.length == limit) e.preventDefault();
                });
            }
        }
    }]);

})();;
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function(predicate) {
     // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return undefined.
      return undefined;
    },
    configurable: true,
    writable: true
  });
};
(function () {
    'use strict';
    angular.module('ies').controller('previewFormCtrl', previewFormCtrl);
    previewFormCtrl.$inject = ['$scope', '$rootScope', '$timeout', '$state', '$stateParams', '$window', 'labelTranslation',
        'signupService', 'applicantService', 's3'];
    function previewFormCtrl($scope, $rootScope, $timeout, $state, $stateParams, $window, labelTranslation, signupService, applicantService, s3) {
        $scope.viewMode = false;
        $scope.viewRegistrationMode = false;
        if ($stateParams.id) {
            sessionStorage.setItem('sessionId', $stateParams.id);
        }

        if (!$rootScope.currentApplicant) {
            //prompt user to login
            $state.go('ies.enquiry.login');
            return;
        }
        $rootScope.previewPageLoader = false;

        $scope.getEnquiryStatus($rootScope.currentApplicant);

        $scope.title = labelTranslation.english;

        // you can change default debounce globally
        $scope.$validationOptions = { debounce: 500, preValidateFormElements: false, isolatedScope: $scope };

        $scope.applicant = $rootScope.currentApplicant;

        $scope.isAdminRole = $rootScope.currentApplicant && $rootScope.currentApplicant.roles && $rootScope.currentApplicant.roles.includes('ADMIN');

        $scope.getFileFromS3 = function (file) {

            s3.getDownloadUrl(file, function (err, res) {
                if (res && res.signedUrl) {
                    s3.getFileObjFromS3(res.signedUrl, function (err, res) {
                        if (res) {
                            const blob = new Blob([res], {
                                type: 'image/jpg'
                            });
                            var strWindowFeatures = "location=yes,left=1000,top=100,height=600,width=600,scrollbars=yes,status=yes";
                            var url = URL.createObjectURL(blob);
                            var newWindow = window.open(url, "_blank", strWindowFeatures);
                            newWindow.document.title = file.originalname;
                        } else {
                            console.log("Failed to download the file " + file.originalname);
                        }
                    });
                } else {
                    return;
                }
            });
        }

        $scope.getPdfFileFromS3 = function (file) {
            s3.getDownloadUrl(file, function (err, res) {
                if (res && res.signedUrl) {
                    s3.getFileObjFromS3(res.signedUrl, function (err, res) {
                        if (res) {
                            const blob = new Blob([res], {
                                type: 'application/pdf'
                            });
                            var strWindowFeatures = "location=yes,left=1000,top=100,height=600,width=600,scrollbars=yes,status=yes";
                            var url = URL.createObjectURL(blob);
                            var newWindow = window.open(url, "_blank", strWindowFeatures);
                            newWindow.document.title = file.originalname;
                        } else {
                            console.log("Failed to download the file " + file.originalname);
                        }
                    });
                } else {
                    return;
                }
            });
        }

        function setDisplayPicture(displayPicture) {
            s3.getDownloadUrl(displayPicture, function (err, res) {
                if (res && res.signedUrl) {
                    $scope.displayPictureUrl = new URL(res.signedUrl);
                } else {
                    $scope.displayPictureUrl = "assets/images/blank-photo.jpg";
                    $scope.addErrorMsg("Failed to load the display picture");
                    return;
                }
            });
        }

        if ($scope.applicant.personalInfo.profilePic) {
            setDisplayPicture($scope.applicant.personalInfo.profilePic);
        }


        $scope.editApplicationForm = function () {
            $rootScope.previewPageLoader = true;
            applicantService.enableToEdit($scope.applicant.applicantNo, function (err, res) {
                $rootScope.previewPageLoader = false;
                if (!err && res) {
                    $timeout(function () {
                        $state.go('ies.enquiry.form');
                    }, 100);
                }
            });
        };

        $scope.communityDisplayName = function (val) {
            if (val == 'MBC-O') {
                return 'MBC-OTHERS'
            } else {
                return val;
            }
        }

        $timeout(function () {
            $('[data-toggle="popover"]').popover();
        }, 1000)

        $scope.previewChecklistArray = [
            {
                "sectionNo": 1,
                "fieldName": 'personalInformation',
                "sectionName": 'Personal Details',
                "sectionId": "personal-body",
                "verified": false,
            },
            {
                "sectionNo": 2,
                "fieldName": 'communityDetails',
                "sectionName": 'Community Details',
                "sectionId": "community-body",
                "verified": false
            },
            {
                "sectionNo": 3,
                "fieldName": 'familyInformation',
                "sectionName": "Parent's Details",
                "sectionId": "family-body",
                "verified": false
            },
            {
                "sectionNo": 4,
                "fieldName": 'contactInformation',
                "sectionName": 'Contact Details',
                "sectionId": "contact-body",
                "verified": false
            },
            {
                "sectionNo": 5,
                "fieldName": 'academicInformation',
                "sectionName": 'Academic Details',
                "sectionId": "academic-body",
                "verified": false
            }
            ,
            {
                "sectionNo": 6,
                "fieldName": 'preferenceInfo',
                "sectionName": 'Preferences',
                "sectionId": "preference-body",
                "verified": false
            }
        ];

        var firstScroll = true;
        var windowWidth = $(window).width();
        function sectionScroll(id, first) {
            var scrollWidth = (windowWidth > 999) ? 160 : 180;
            if (firstScroll && !first) {
                firstScroll = false;
                scrollWidth = (windowWidth > 999) ? 235 : 255;
            }
            $('html, body').animate({
                scrollTop: $("#" + id).offset().top - scrollWidth
            }, 250);
        }

        function checkVerifiedAllSection() {
            var sections = $scope.previewChecklistArray.filter(function (val) {
                return val.verified === true;
            });
            return ($scope.previewChecklistArray.length == sections.length);
        }

        $rootScope.enableEligibleProgramSelection = false;
        $scope.checklistVerified = false;
        $scope.checkVerifiedSection = function (index, first) {
            var firstCheck = false;
            $scope.previewChecklistSection = null;
            if ($scope.previewChecklistArray.length == index) {
                $scope.previewChecklistArray.forEach(function (val) {
                    if (val.verified == false && firstCheck == false) {
                        $scope.previewChecklistSection = val;
                        firstCheck = true;
                        sectionScroll(val.sectionId, first);
                    }
                });
            } else {
                $scope.previewChecklistArray.forEach(function (val, currentIndex) {
                    if (index == currentIndex && val.verified == false && firstCheck == false) {
                        $scope.previewChecklistSection = val;
                        firstCheck = true;
                        sectionScroll(val.sectionId, first);
                    }
                });
            }
            $timeout(function () {
                if ($scope.previewChecklistSection == null) {
                    if (checkVerifiedAllSection()) {
                        $scope.showSubmit = true;
                    }
                }
            })
        }

        $timeout(function () {
            $scope.checkVerifiedSection(0, true);
        }, 250)

        $scope.markAsVerify = function (sectionNo) {
            $scope.previewChecklistArray.forEach(function (val, index) {
                if (val.sectionNo == sectionNo) {
                    $scope.previewChecklistArray[index].verified = true;
                    var serIndex = index + 1;
                    $scope.checkVerifiedSection(serIndex);
                }
            });
        }

        $scope.viewCheckList = function (sectionNo) {
            $scope.previewChecklistArray.forEach(function (val, index) {
                if (val.sectionNo == sectionNo && val.verified == false) {
                    $scope.previewChecklistSection = val;
                    sectionScroll(val.sectionId);
                }
            });
        }

        $scope.submit = function () {
            $rootScope.applicationFormLoader = true;
            applicantService.submit($scope.applicant.applicantNo, function (err, res) {
                if (!err) {
                    $rootScope.currentApplicant = res;
                    $("#confirmSubmit").modal('hide');
                    $('.modal-backdrop').remove();
                    $timeout(function () {
                        $rootScope.applicationFormLoader = false;
                        $state.go('ies.enquiry.status');
                    }, 1000)
                    return;
                } else {
                    $rootScope.applicationFormLoader = false;
                    $scope.serverErrorMsg = err.message;
                    $("html, body").animate({ scrollTop: "0" }, 750);
                }
            })
        }
    }

})();;
(function () {
    'use strict';

    angular.module('ies').controller('academicInfoCtrl', academicInfoCtrl);
    academicInfoCtrl.$inject = ['$scope', '$rootScope', '$timeout', '$window', 'applicantService', 's3'];
    function academicInfoCtrl($scope, $rootScope, $timeout, $window, applicantService, s3) {
        $scope.docs.hseMarkSheet.error = false;

        function getYears(iteration) {
            var yearIteration = $rootScope.basicConfig.currentYear;
            var yearOfPassing = [];
            for (var i = 0; i < iteration; i++) {
                yearOfPassing.push(yearIteration);
                yearIteration -= 1;
            }
            return yearOfPassing;
        }

        $scope.appearedYears = getYears(6);

        $scope.calculateSubjectTotal = function (subject) {
            subject.total.outOf = 0;
            subject.total.secured = 0;
            if (subject.plus1.outOf) {
                subject.total.outOf += subject.plus1.outOf;
            }
            if (subject.plus2.outOf) {
                subject.total.outOf += subject.plus2.outOf;
            }
            if (subject.plus1.secured) {
                subject.total.secured += subject.plus1.secured;
            }
            if (subject.plus2.secured) {
                subject.total.secured += subject.plus2.secured;
            }
            return subject;
        }

        $scope.cutOffCompute = function () {
            $scope.applicant.eduInfo.cutOff = window._CUTOFFMAP[$scope.applicant.eduInfo.board]($scope.applicant.eduInfo.subjects);
        }

        $scope.checkAbnormalityInMarks = function () {
            var subjectSet = new Set();
            $rootScope.hasAbnormalMark = false;
            $scope.applicant.eduInfo.subjects.forEach(function (subject) {
                if (subject.name) {
                    if (subject.plus1.secured && subject.plus1.outOf) {
                        if (((subject.plus1.secured / subject.plus1.outOf) * 100) <= 30) {
                            subjectSet.add(subject.name + " (in 11th/+1)");
                        }
                    }
                    if (subject.plus2.secured && subject.plus2.outOf) {
                        if (((subject.plus2.secured / subject.plus2.outOf) * 100) <= 30) {
                            subjectSet.add(subject.name + " (in 12th/+2)");
                        }
                    }
                }
            })
            var subjects = Array.from(subjectSet);
            if (subjects.length) {
                $rootScope.hasAbnormalMark = true;
                $scope.abnormalMarkError = "Check the entered marks for accuracy." +
                    " Review the out-of-marks and marks obtained for each subject to ensure correctness: <strong>" + subjects.join(" , ") + "</strong>";
            } else {
                delete $scope.applicant.eduInfo.isAbnormal;
            }
        }
        $scope.totalAndPercentageCompute = function () {
            var DATA = window._TOTAL_PERCENTAGE($scope.applicant.eduInfo.subjects);
            if (DATA.total && DATA.total.secured && DATA.total.outOf) {
                $scope.applicant.eduInfo.total = DATA.total;
            }
            if (DATA.percentage) {
                $scope.applicant.eduInfo.percentage = DATA.percentage;
            }
        }

        $scope.changeSubject = function (index) {

            if ($scope.applicant && $scope.applicant.eduInfo && $scope.applicant.eduInfo.subjects &&
                $scope.applicant.eduInfo.subjects[index].name == "NA") {
                let copy = JSON.parse(JSON.stringify($scope.applicant.eduInfo.subjects[2]));
                copy.plus1.secured = "";
                copy.plus2.secured = "";
                copy.total.secured = 0;

                $scope.applicant.eduInfo.subjects[index].plus1 = copy.plus1;
                $scope.applicant.eduInfo.subjects[index].plus2 = copy.plus2;
                $scope.applicant.eduInfo.subjects[index].total = copy.total;

                $scope.totalAndPercentageCompute()
            }
        }

        $scope.setSubjectAndMaxMark = function (overRide) {

            if ($scope.applicant && $scope.applicant.eduInfo && (!$scope.applicant.eduInfo.subjects || overRide)) {
                if ($scope.applicant.eduInfo.marksAvailable || $scope.applicant.eduInfo.marksAvailable == false) {
                    applicantService.getDefaultSubjectPattern($scope.applicant.eduInfo.board, function (err, res) {
                        if (!err) {
                            if ($scope.applicant.eduInfo.total && $scope.applicant.eduInfo.total.outOf)
                                delete $scope.applicant.eduInfo.total.outOf;
                            if ($scope.applicant.eduInfo.total && $scope.applicant.eduInfo.total.secured)
                                delete $scope.applicant.eduInfo.total.secured;
                            if ($scope.applicant.eduInfo.percentage)
                                delete $scope.applicant.eduInfo.percentage;
                            if ($scope.applicant.eduInfo.cuttOff)
                                delete $scope.applicant.eduInfo.cuttOff;
                            if (!$scope.applicant.eduInfo.subjects) {
                                $scope.applicant.eduInfo.subjects = JSON.parse(JSON.stringify(res));
                            }
                            else {
                                $scope.applicant.eduInfo.subjects.forEach(function (subject, index) {
                                    subject.plus1 = res[index].plus1;
                                    subject.plus2 = res[index].plus2;
                                    subject.total = res[index].total;
                                });
                            }
                            $scope.applicant.eduInfo.subjects.forEach(function (subject) {
                                subject = $scope.calculateSubjectTotal(subject);
                            })
                        }
                        else {
                            console.log("Error wile fetching default subject pattern " + JSON.stringify(err));
                        }
                    })

                }
            } else {
                $scope.applicant.eduInfo.subjects.forEach(function (subject) {
                    subject = $scope.calculateSubjectTotal(subject);
                })
            }

            $timeout(function () {
                $('[data-toggle="popover"]').popover();
            }, 1000)

        }

        $scope.showMarksAvailableOption = function () {
            if ($scope.applicant && $scope.applicant.eduInfo) {
                if ($scope.applicant.eduInfo.regNo && $scope.applicant.eduInfo.board && $scope.applicant.eduInfo.appearedYearOfExam) {
                    $scope.showMarksAvailable = true;
                }
                else {
                    $scope.showMarksAvailable = false;
                }
            }
        }

        $scope.showSubjectTableOption = function () {
            $scope.showSubjectTable = ($scope.applicant.eduInfo.marksAvailable || ($scope.applicant.eduInfo.marksAvailable == false));
        }

        $scope.maxMarkFieldDisabled = function () {
            if (new Set(["TNHSC", "CBSE", "IB", "IGCSE", "ISC", "NIOS"]).has($scope.applicant.eduInfo.board)) {
                $scope.disableMaxMark = true;
            }
            $scope.disableMaxMark = false;
        }

        $scope.eduInfoAddressCountry = function (type) {
            if ($scope.applicant.eduInfo && $scope.applicant.eduInfo[type] && $scope.applicant.eduInfo[type].country && $scope.applicant.eduInfo[type].country != 'INDIA') {
                var findIndex = $scope.states.findIndex(function (state) {
                    return state.code == "OTHERS";
                });
                if (findIndex == -1) {
                    $scope.states.push({
                        "code": "OTHERS",
                        "name": "OTHERS"
                    });
                }
                $scope.applicant.eduInfo[type].state = 'OTHERS';
                $scope.applicant.eduInfo[type].district = "";
                $scope.applicant.eduInfo[type].pincode = "";

            } else {
                var findIndex = $scope.states.findIndex(function (state) {
                    return state.code == "OTHERS";
                });
                if (findIndex != -1) {
                    $scope.states.splice(findIndex, 1);
                }
                if ($scope.applicant.eduInfo[type].state == "OTHERS") {
                    $scope.applicant.eduInfo[type].state = "";
                    $scope.applicant.eduInfo[type].pincode = "";
                }
            }
        }

        $scope.eduInfoAddressCountryChange = function () {
            if ($scope.applicant.eduInfo && $scope.applicant.eduInfo.school && $scope.applicant.eduInfo.school.country)
                $scope.eduInfoAddressCountry("school");
        }

        $scope.eduInfoAddressStateChanges = function () {
            $scope.applicant.eduInfo.school.district = '';
            if ($scope.applicant.eduInfo.school.state && $scope.applicant.eduInfo.school.state != 'OTHERS' && $scope.applicant.eduInfo.school.country != 'INDIA') {
                $scope.applicant.eduInfo.school.country = "INDIA";
            }
        }

        $scope.addressStateChanges = function (type) {
            $scope.applicant.familyAndContactInfo[type].district = '';
            if ($scope.applicant.familyAndContactInfo[type].state && $scope.applicant.familyAndContactInfo[type].state != 'OTHERS' && $scope.applicant.familyAndContactInfo[type].country != 'INDIA') {
                $scope.applicant.familyAndContactInfo[type].country = "INDIA";
            }
        }

        if ($scope.applicant && $scope.applicant.eduInfo) {
            // load value and check for mark entry
            if ($scope.applicant.eduInfo.marksAvailable == true) {
                $("#marksAvailable2").prop("checked", true);
            }
            else if ($scope.applicant.eduInfo.marksAvailable == false) {
                $("#marksAvailable1").prop("checked", true);
            }

            if (!$scope.applicant.eduInfo.appearedYearOfExam) {
                $scope.applicant.eduInfo.appearedYearOfExam = $rootScope.basicConfig.currentYear;
            }

            if ($scope.applicant.eduInfo.regNo && $scope.applicant.eduInfo.board && $scope.applicant.eduInfo.appearedYearOfExam) {
                $scope.showMarksAvailableOption();
                if ($scope.showMarksAvailable) {
                    $scope.showSubjectTableOption();
                    if ($scope.showSubjectTable) {
                        $scope.setSubjectAndMaxMark();
                    }
                }
            }
        }

        // hse marksheet dropzone end
        function getCertcount() {
            if ($scope.applicant.eduInfo && $scope.applicant.eduInfo.attachments) {
                return $scope.applicant.eduInfo.attachments.length;
            }
            return 0;
        }

        var hseMarkSheetCount = getCertcount();

        function removeHseMarkSheet(removedFile) {
            s3.removeMultipleCertificates($scope.applicant.contactNo, "hseMarkSheet", removedFile.url, "", function (err, response) {
                $("#hseMarkSheetDeleteConfirmModal").modal("hide");
                if (!err) {
                    if (hseMarkSheetCount <= 2) {
                        $('.dropzone-click-hseMarkSheet').parent().parent().parent().find('.upload-image-custom-error').hide();
                    }
                    hseMarkSheetCount -= 1;
                    // to remove the record from cloned array for applicant record
                    var certs = $scope.applicant["eduInfo"].attachments;
                    if (!certs) {
                        return;
                    }
                    var indexToRemove = -1;
                    for (var i = 0; i < certs.length; i++) {
                        if (certs[i].url == removedFile.url) {
                            indexToRemove = i;
                            break;
                        }
                    }
                    if (indexToRemove != -1) {
                        certs.splice(indexToRemove, 1);
                    }
                } else {
                    $scope.docs.hseMarkSheet.error = true;
                }
            });
        }

        function processHseMarkSheet(file) {
            if (!file) {
                return;
            }

            var fileObject = {
                url: file.signedRequest.filePath,
                contentType: file.type,
                originalname: file.name,
            };

            if (!$scope.applicant.eduInfo) {
                $scope.applicant.eduInfo = { "attachments": [] };
            }

            if (!$scope.applicant.eduInfo.attachments) {
                $scope.applicant.eduInfo.attachments = [];
            }

            $scope.applicant.eduInfo.attachments.push(fileObject);
            return fileObject;
        }

        $scope.setEnvForDeleteHseMarkSheet = function (fileSelected) {
            $scope.certificateToRemove = fileSelected;
            $("#hseMarkSheetDeleteConfirmModal").modal("show");
        }

        $scope.hseMarkSheet = {
            dzOptions: {
                url: "#",
                method: "put",
                parallelUploads: $scope.docs.hseMarkSheet.maxFile,
                acceptedFiles: 'image/jpg,image/jpeg,image/png',
                autoProcessQueue: true,
                maxFilesize: $scope.docs.hseMarkSheet.fileSize,
                paramName: function () {
                    return "certificates";
                },
                maxFiles: $scope.docs.hseMarkSheet.maxFile,
                uploadMultiple: (($scope.docs.hseMarkSheet.maxFile > 1) ? true : false),
                params: $scope.dropzoneContext,
                headers: $scope.dropzoneContext,
                renameFile: function (file) {
                    file.upload.filename = file.name;
                },
                accept: function (file) {
                    if (hseMarkSheetCount > $scope.docs.hseMarkSheet.maxFile) {
                        $('.dropzone-click-hseMarkSheet').parent().parent().parent().find('.upload-image-custom-error').show();
                    } else {
                        hseMarkSheetCount += 1;
                        $('.dropzone-click-hseMarkSheet').parent().parent().parent().find('.upload-image-custom-error').hide();
                        if ($scope.docs.hseMarkSheet.error) {
                            $('.dropzone-click-hseMarkSheet').parent().parent().parent().find('.upload-image-custom-error').show();
                        }
                        $scope.docs.hseMarkSheet.loader = true;
                        $scope.uploadFileToS3("hseMarkSheet", file, function (uploadErr, uploadRes) {
                            if (!uploadErr) {
                                var fileDetails = processHseMarkSheet(uploadRes);
                                s3.saveMultipleCertificates($scope.applicant.contactNo, "hseMarkSheet", [fileDetails], "", function (err, response) {
                                    if (err) {
                                        $('.dropzone-click-hseMarkSheet').parent().parent().parent().find('.upload-image-s3-custom-error').show();
                                        $scope.docs.hseMarkSheet.error = true;
                                    } else {
                                        $('.dropzone-click-hseMarkSheet').parent().parent().parent().find('.upload-image-s3-custom-error').hide();
                                    }
                                });
                                $scope.docs.hseMarkSheet.loader = false;
                            } else {
                                $scope.docs.hseMarkSheet.loader = false;
                                hseMarkSheetCount -= 1;
                                $('.dropzone-click-hseMarkSheet').parent().parent().parent().find('.upload-image-s3-custom-error').show();
                                $scope.docs.hseMarkSheet.error = true;
                            }
                        });
                    }
                },
                init: function () {
                    $scope.hseMarkSheetDzScope = this;
                    this.on("addedfile", function (file) {
                    });
                }
            },
            dzCallbacks: {
                init: function () {
                    this.on("addedfile", function (file) {
                    });
                },
                "sending": function (file, xhr, formData) {
                },
                "addedfile": function (file) {
                },
                "thumbnail": function (file, url) {
                    file.previewElement.querySelector("img").src = url;
                },
                "successmultiple": function (files, xhr) {
                    $('.dropzone-click-hseMarkSheet').parent().parent().parent().find('.upload-image-custom-error').hide();
                },
                "error": function (file, response) {  // and then can you have your error callback
                    $scope.docs.hseMarkSheet.error = true;
                    $('.dropzone-click-hseMarkSheet').parent().parent().parent().find('.upload-image-custom-error').show();
                },
                "removedfile": function (file) {
                    removeHseMarkSheet(file);
                },
                "complete": function (file) {
                }
            },
            dzMethods: {
            }
        };

        $scope.removeFile = function () {
            var file = $scope.certificateToRemove;
            //dropzone files are different than the file object we have stored
            var dzFiles = $scope.hseMarkSheetDzScope.files;
            if (!dzFiles) {
                $scope.hseMarkSheetDzScope.removeFile(file);
                return;
            }

            $scope.hseMarkSheetDzScope.removeFile(file);
        }
        // hse marksheet dropzone end

        // jee score sheet start

        $scope.jeeScoreSheet = {
            dzOptions: {
                url: "#",
                method: "get",
                parallelUploads: $scope.docs.jeeScoreSheet.maxFile,
                acceptedFiles: 'image/jpg,image/jpeg,image/png',
                autoProcessQueue: true,
                maxFilesize: $scope.docs.jeeScoreSheet.fileSize,
                paramName: function () {
                    return "jeeScoreSheet";
                },
                maxFiles: $scope.docs.jeeScoreSheet.maxFile,
                uploadMultiple: (($scope.docs.jeeScoreSheet.maxFile > 1) ? true : false),
                params: $scope.dropzoneContext,
                headers: $scope.dropzoneContext,
                renameFile: function (file) {
                    file.upload.filename = file.name;
                },
                accept: function (file) {
                    $scope.docs.jeeScoreSheet.error = false;
                    $scope.docs.jeeScoreSheet.loader = true;
                    $scope.uploadFileToS3("jeeScoreSheet", file, function (uploadErr, uploadRes) {
                        if (!uploadErr) {
                            var fileObject = processJeeScoreSheet(uploadRes);
                            s3.saveSingleCertificate($scope.applicant.contactNo, "jeeScoreSheet", fileObject, "", function (err, response) {
                                if (err) {
                                    $scope.docs.jeeScoreSheet.error = true;
                                }
                                $scope.docs.jeeScoreSheet.loader = false;
                            });
                        } else {
                            $scope.docs.jeeScoreSheet.error = true;
                            $scope.docs.jeeScoreSheet.loader = false;
                        }
                    });
                },
                init: function () {
                    $scope.jeeScoreSheetDzScope = this;
                    this.on("addedfile", function (file) {
                    });
                }
            },
            dzCallbacks: {
                init: function () {
                    this.on("addedfile", function (file) {
                    });
                },
                "accept": function (file) {
                },
                "sending": function (file, xhr, formData) {
                },
                "addedfile": function (file) {
                },
                "thumbnail": function (file, url) {
                    file.previewElement.querySelector("img").src = url;
                },
                "success": function (file, xhr) {
                    $('.dropzone-click-jeeScoreSheet').parent().parent().parent().find('.upload-image-custom-error').hide();
                },
                "error": function (file, response) {  // and then can you have your error callback
                    $scope.docs.jeeScoreSheet.error = true;
                    $('.dropzone-click-jeeScoreSheet').parent().parent().parent().find('.upload-image-custom-error').show();
                },
                "removedfile": function (file) {
                    var fileObj = $scope.applicant.eduInfo.jee.attachment;
                    removeJeeScoreSheet(fileObj);
                },
                "complete": function (file) {
                }
            },
            dzMethods: {
            }
        };

        function processJeeScoreSheet(file) {
            if (!file) {
                return;
            }

            var fileObject = {
                url: file.signedRequest.filePath,
                contentType: file.type,
                originalname: file.name
            }

            if (!$scope.applicant.eduInfo.jee) {
                $scope.applicant.eduInfo.jee = { "attachment": {} };
            }

            $scope.applicant.eduInfo.jee.attachment = fileObject;
            return fileObject;
        }

        function removeJeeScoreSheet(fileObject) {
            s3.removeSingleCertificate($scope.applicant.contactNo, "jeeScoreSheet", fileObject, "", function (err, response) {
                $("#communityCertDeleteConfirmModal").modal('hide');
                if (!err) {
                    delete $scope.applicant.eduInfo.jee.attachment;
                }
            });

        }

        $scope.clearJeeDetails = function () {
            $scope.applicant.eduInfo.jee = {
                "attended": false
            }
        }

        // jee score sheet end
    }
})();;
(function () {
    'use strict';

    angular.module('ies').controller('communityInfoCtrl', communityInfoCtrl);
    communityInfoCtrl.$inject = ['$scope', '$rootScope', '$timeout', 's3'];
    function communityInfoCtrl($scope, $rootScope, $timeout, s3) {

        $scope.communtiyCertError = false;

        $scope.showCommunityCertUpload = function (applicant) {
            if (applicant.communityInfo) {
                return (applicant.communityInfo.community != 'OC') && (applicant.communityInfo.issuedBy == 'TN');
            }
        }

        if ($scope.applicant && $scope.applicant.communityInfo && $scope.applicant.communityInfo.community) {
            $scope.castelist = $scope.castes[$scope.applicant.communityInfo.community];
        }

        $scope.handleCommunityChange = function () {
            $scope.applicant.communityInfo.selectAllCasteList = false;

            $scope.castelist = $scope.castes[$scope.applicant.communityInfo.community];

            if ($scope.applicant.communityInfo.community == 'OC') {
                $scope.applicant.communityInfo.issuedBy = 'NA';
                $scope.applicant.communityInfo.caste = ($scope.applicant.communityInfo.caste) ? $scope.applicant.communityInfo.caste : '';
                $scope.communityCertDisable = true;
                $scope.casteDisable = true;
            } else {
                $scope.communityCertDisable = false;
                $scope.casteDisable = false;
                $scope.applicant.communityInfo.issuedBy = 'TN';
                $scope.applicant.communityInfo.caste = ($scope.applicant.communityInfo.caste) ? $scope.applicant.communityInfo.caste : '';
            }

            if ($scope.applicant.communityInfo && $scope.applicant.communityInfo.attachment) {
                $scope.$broadcast("removeCommunityCert", $scope.applicant.communityInfo.attachment);
            }

            $timeout(function () {
                angular.element('.community-cert-validation .validation.text-danger').remove();
            }, 100);

            $timeout(function () {
                $('[data-toggle="popover"]').popover();
            }, 1000)
        }

        if ($scope.applicant.communityInfo && $scope.applicant.communityInfo.community) {
            $scope.handleCommunityChange()
        }

        function allCasteList() {
            $scope.listAllCaste = [];
            angular.forEach($rootScope.castes, function (key, value) {
                for (var item in key) {
                    var res = $scope.listAllCaste.find(obj => obj.name === key[item].name);
                    if (!res) {
                        $scope.listAllCaste.push(key[item]);
                    }
                }
                $scope.listAllCaste.sort(function (a, b) {
                    return a.value.localeCompare(b.value);
                });
            });
        }

        $scope.changeCasteList = function () {
            if ($scope.applicant.communityInfo && $scope.applicant.communityInfo.caste) {
                $scope.applicant.communityInfo.caste = '';
            }

            if ($scope.applicant.communityInfo && !$scope.applicant.communityInfo.selectAllCasteList) {
                allCasteList();
            }
        }

        $scope.communityIssuedByChanges = function () {
            if ($scope.applicant.communityInfo && $scope.applicant.communityInfo.issuedBy == "OTHERS") {
                $scope.applicant.communityInfo.community = "OC";
                $scope.communityValidation = true;
                $scope.casteDisable = true;
                $scope.applicant.communityInfo.caste = "";
            } else if ($scope.applicant.communityInfo && $scope.applicant.communityInfo.issuedBy && $scope.communityValidation) {
                $scope.applicant.communityInfo.community = "";
                $scope.communityValidation = false;
                $scope.casteDisable = true;
                $scope.applicant.communityInfo.caste = "";
            }
        }

        function processCommunityCert(file) {
            if (!file) {
                return;
            }

            var fileObject = {
                url: file.signedRequest.filePath,
                contentType: file.type,
                originalname: file.name
            }

            if (!$scope.applicant.communityInfo) {
                $scope.applicant.communityInfo = { "attachment": {} };
            }

            $scope.applicant.communityInfo.attachment = fileObject;
            return fileObject;
        }

        function removeCommunityCert(fileObject) {
            s3.removeSingleCertificate($scope.applicant.contactNo, "communityCert", fileObject, "", function (err, response) {
                $("#communityCertDeleteConfirmModal").modal('hide');
                if (!err) {
                    delete $scope.applicant.communityInfo.attachment;
                } else {
                    $scope.communtiyCertError = true;
                }
            });
        }

        $scope.casteChanges = function () {
            if ($scope.applicant.communityInfo.caste == 'NA') {
                $scope.applicant.communityInfo.caste = "";
            }
        }

        $scope.communityCert = {
            dzOptions: {
                url: "#",
                method: "get",
                parallelUploads: $scope.docs.communityCert.maxFile,
                acceptedFiles: 'image/jpg,image/jpeg,image/png',
                autoProcessQueue: true,
                maxFilesize: $scope.docs.communityCert.fileSize,
                paramName: function () {
                    return "communityCert";
                },
                maxFiles: $scope.docs.communityCert.maxFile,
                uploadMultiple: (($scope.docs.communityCert.maxFile > 1) ? true : false),
                params: $scope.dropzoneContext,
                headers: $scope.dropzoneContext,
                renameFile: function (file) {
                    file.upload.filename = file.name;
                },
                accept: function (file) {
                    $scope.docs.communityCert.error = false;
                    $scope.docs.communityCert.loader = true;
                    $scope.uploadFileToS3("communityCert", file, function (uploadErr, uploadRes) {
                        if (!uploadErr) {
                            var fileObject = processCommunityCert(uploadRes);
                            s3.saveSingleCertificate($scope.applicant.contactNo, "communityCert", fileObject, "", function (err, response) {
                                if (err) {
                                    $scope.docs.communityCert.error = true;
                                }
                                $scope.docs.communityCert.loader = false;
                            });
                        } else {
                            $scope.docs.communityCert.error = true;
                            $scope.docs.communityCert.loader = false;
                        }
                    });
                },
                init: function () {
                    $scope.communityCertDzScope = this;
                    this.on("addedfile", function (file) {
                    });
                }
            },
            dzCallbacks: {
                init: function () {
                    this.on("addedfile", function (file) {
                    });
                },
                "accept": function (file) {
                },
                "sending": function (file, xhr, formData) {
                },
                "addedfile": function (file) {
                },
                "thumbnail": function (file, url) {
                    file.previewElement.querySelector("img").src = url;
                },
                "success": function (file, xhr) {
                    $('.dropzone-click-communityCert').parent().parent().parent().find('.upload-image-custom-error').hide();
                },
                "error": function (file, response) {  // and then can you have your error callback
                    $scope.docs.communityCert.error = true;
                    $('.dropzone-click-communityCert').parent().parent().parent().find('.upload-image-custom-error').show();
                },
                "removedfile": function (file) {
                    var fileObj = $scope.applicant.communityInfo.attachment;
                    removeCommunityCert(fileObj);
                },
                "complete": function (file) {
                }
            },
            dzMethods: {
            }
        };
    }
})();
;
(function () {
    'use strict';

    angular.module('ies').controller('contactInfoCtrl', contactInfoCtrl);
    contactInfoCtrl.$inject = ['$scope'];
    function contactInfoCtrl($scope) {

        if ($scope.applicant.familyAndContactInfo && $scope.applicant.familyAndContactInfo.sameAddress) {
            $scope.isSameAddress = true;
        }

        $scope.sameAddress = function () {
            $scope.applicant.familyAndContactInfo.permanentAddress = $scope.applicant.familyAndContactInfo.address;
            $scope.isSameAddress = true;
        }

        $scope.copyAddress = function () {
            if ($scope.isSameAddress) {
                $scope.applicant.familyAndContactInfo.permanentAddress = $scope.applicant.familyAndContactInfo.address;
            }
        }

        $scope.differentAddress = function () {
            $scope.applicant.familyAndContactInfo.permanentAddress = {};
            $scope.isSameAddress = false;
        }

        //Address State and Country
        $scope.addressCountry = function (addressType) {
            if ($scope.applicant.familyAndContactInfo && $scope.applicant.familyAndContactInfo[addressType] && $scope.applicant.familyAndContactInfo[addressType].country && $scope.applicant.familyAndContactInfo[addressType].country != 'INDIA') {
                var findIndex = $scope.states.findIndex(function (state) {
                    return state.code == "OTHERS";
                });
                if (findIndex == -1) {
                    $scope.states.push({
                        "code": "OTHERS",
                        "name": "OTHERS"
                    });
                }
                $scope.applicant.familyAndContactInfo[addressType].state = 'OTHERS';
                $scope.applicant.familyAndContactInfo[addressType].district = "";
                $scope.applicant.familyAndContactInfo[addressType].pincode = "";
            } else {
                var findIndex = $scope.states.findIndex(function (state) {
                    return state.code == "OTHERS";
                });
                if (findIndex != -1) {
                    $scope.states.splice(findIndex, 1);
                }
                if ($scope.applicant.familyAndContactInfo[addressType].state == "OTHERS") {
                    $scope.applicant.familyAndContactInfo[addressType].state = "";
                    $scope.applicant.familyAndContactInfo[addressType].district = "";
                    $scope.applicant.familyAndContactInfo[addressType].pincode = "";
                }
            }
        }

        $scope.addressCountryChange = function (type) {
            if ($scope.applicant.familyAndContactInfo && $scope.applicant.familyAndContactInfo[type] && $scope.applicant.familyAndContactInfo[type].country)
                $scope.addressCountry(type);
        }

        $scope.addressStateChanges = function (type) {
            $scope.applicant.familyAndContactInfo[type].district = '';
            if ($scope.applicant.familyAndContactInfo[type].state && $scope.applicant.familyAndContactInfo[type].state != 'OTHERS' && $scope.applicant.familyAndContactInfo[type].country != 'INDIA') {
                $scope.applicant.familyAndContactInfo[type].country = "INDIA";
            }
        }

        function setOthersForAddress() {
            var others = {
                "code": "OTHERS",
                "name": "OTHERS"
            }

            if ($scope.applicant.eduInfo) {
                if ($scope.applicant.eduInfo.school && $scope.applicant.eduInfo.school.country != 'INDIA') {
                    var findIndex = $scope.schoolStates.findIndex(function (state) {
                        return state.code == "OTHERS";
                    });
                    if (findIndex == -1) {
                        $scope.schoolStates.push(others);
                    }
                    $scope.applicant.eduInfo.school.state = 'OTHERS';
                }
                if ($scope.applicant.eduInfo.college && $scope.applicant.eduInfo.college.country != 'INDIA') {
                    var findIndex = $scope.collegeStates.findIndex(function (state) {
                        return state.code == "OTHERS";
                    });
                    if (findIndex == -1) {
                        $scope.collegeStates.push(others);
                    }
                    $scope.applicant.eduInfo.college.state = 'OTHERS';
                }
            }

            if ($scope.applicant.familyAndContactInfo) {
                if ($scope.applicant.familyAndContactInfo.address && $scope.applicant.familyAndContactInfo.address.country != 'INDIA') {
                    var findIndex = $scope.states.findIndex(function (state) {
                        return state.code == "OTHERS";
                    });
                    if (findIndex == -1) {
                        $scope.states.push(others);
                    }
                    $scope.applicant.familyAndContactInfo.address.state = 'OTHERS';
                }
                else if ($scope.applicant.familyAndContactInfo.permanentAddress && $scope.applicant.familyAndContactInfo.permanentAddress.country != 'INDIA') {
                    var findIndex = $scope.states.findIndex(function (state) {
                        return state.code == "OTHERS";
                    });
                    if (findIndex == -1) {
                        $scope.states.push(others);
                    }
                    $scope.applicant.familyAndContactInfo.permanentAddress.state = 'OTHERS';
                }
            }

        }
        setOthersForAddress();

    }

})();
;
(function () {
    'use strict';

    angular.module('ies').controller('familyInfoCtrl', familyInfoCtrl);
    familyInfoCtrl.$inject = ['$scope', '$rootScope', '$timeout'];
    function familyInfoCtrl($scope, $rootScope, $timeout) {

        $rootScope.fatherContactNo = true;
        $rootScope.motherContactNo = true;
        $rootScope.validatefatherContactNo = true;
        $rootScope.validatemotherContactNo = true;

        $scope.OnBlurMobileNoVerify = function () {
            $scope.$broadcast('angularValidation.revalidate', 'mobilenumberVerify');
        }

        if ($scope.applicant.familyAndContactInfo && $scope.applicant.familyAndContactInfo.father && $scope.applicant.familyAndContactInfo.father.contactNo) {
            $rootScope.fatherContactNo = false;
            $rootScope.validatefatherContactNo = false;
        }

        if ($scope.applicant.familyAndContactInfo && $scope.applicant.familyAndContactInfo.mother && $scope.applicant.familyAndContactInfo.mother.contactNo) {
            $rootScope.motherContactNo = false;
            $rootScope.validatemotherContactNo = false;
        }
    }

})();;
(function () {
    'use strict';

    angular.module('ies').controller('personalInfoCtrl', personalInfoCtrl);
    personalInfoCtrl.$inject = ['$scope', '$rootScope', 's3'];
    function personalInfoCtrl($scope, $rootScope, s3) {

        var minYearUG = ($rootScope.basicConfig.currentYear) - 22;
        var maxYearUG = ($rootScope.basicConfig.currentYear) - 16;

        $scope.dateOpts = {
            dateFormat: 'd/m/Y',
            allowInput: false,
            minDate: "01/01/" + minYearUG,
            maxDate: "31/12/" + maxYearUG,
            enable: [
                {
                    from: "01/01/" + minYearUG,
                    to: "31/12/" + maxYearUG
                }
            ]
        };

        $scope.residentialStatusChange = function () {
            if ($scope.applicant.personalInfo.residentialStatus != "INDIAN") {
                $scope.applicant.personalInfo.residentialStatus = "";
                $('#residentialModal').modal('show');
            }
        }

        // profile picture dropzone start
        function processProfilePic(file) {
            if (!file) {
                return;
            }
            var fileObject = {
                url: file.signedRequest.filePath,
                contentType: file.type,
                originalname: file.name
            }

            if (!$scope.applicant.personalInfo) {
                $scope.applicant.personalInfo = {
                    profilePic: {}
                }
            }

            $scope.applicant.personalInfo.profilePic = fileObject;
            return fileObject;
        };

        $scope.profilePic = {
            dzOptions: {
                url: "#",
                method: "get",
                parallelUploads: $scope.docs.profilePic.maxFile,
                acceptedFiles: 'image/jpg,image/jpeg,image/png',
                autoProcessQueue: true,
                maxFilesize: $scope.docs.profilePic.fileSize,
                paramName: function () {
                    return "profilePic";
                },
                maxFiles: $scope.docs.profilePic.maxFile,
                uploadMultiple: (($scope.docs.profilePic.maxFile > 1) ? true : false),
                params: $scope.dropzoneContext,
                headers: $scope.dropzoneContext,
                renameFile: function (file) {
                    file.upload.filename = file.name;
                },
                accept: function (file) {
                    $scope.docs.profilePic.error = false;
                    $scope.docs.profilePic.loader = true;
                    $scope.uploadFileToS3("profilePic", file, function (uploadErr, uploadRes) {
                        if (!uploadErr) {
                            var fileObject = processProfilePic(uploadRes);
                            s3.saveSingleCertificate($scope.applicant.contactNo, "profilePic", fileObject, "", function (err, response) {
                                if (!err) {
                                    $scope.setPicture($scope.applicant.personalInfo.profilePic);
                                } else {
                                    $scope.docs.profilePic.error = true;
                                }
                                $scope.docs.profilePic.loader = false;
                            });
                        } else {
                            $scope.docs.profilePic.loader = false;
                            $scope.docs.profilePic.error = true;
                        }
                    });
                },
                init: function () {
                    $scope.myDropzone = this;
                    this.on("addedfile", function (file) {
                    });
                }
            },
            dzCallbacks: {
                init: function () {
                    this.on("addedfile", function (file) {
                    });
                },
                "sending": function (file, xhr, formData) {
                },
                "addedfile": function (file) {
                },
                "thumbnail": function (file, url) {
                    file.previewElement.querySelector("img").src = url;
                },
                "success": function (file, xhr) {
                },
                "error": function (file, response) {  // and then can you have your error callback
                    $scope.docs.profilePic.error = true;
                },
                "removedfile": function (file) {
                },
                "complete": function (file) {
                }
            },
            dzMethods: {
            }
        };
        // profile picture dropzone end

        // aadhaar dropzone start
        function processAadhar(file) {
            if (!file) {
                return;
            }

            var fileObject = {
                url: file.signedRequest.filePath,
                contentType: file.type,
                originalname: file.name
            }

            if (!$scope.applicant.personalInfo) {
                $scope.applicant.personalInfo = { "aadhaarCard": { "attachment": {} } };
            }

            if (!$scope.applicant.personalInfo.aadhaar) {
                $scope.applicant.personalInfo.aadhaar = { "attachment": {} };
            }

            $scope.applicant.personalInfo.aadhaar.attachment = fileObject;
            return fileObject;
        }

        function removeAadhar(fileObject) {
            s3.removeSingleCertificate($scope.applicant.contactNo, "aadhaarCard", fileObject, "", function (err, response) {
                $("#aadhaarCardDeleteConfirmModal").modal('hide');
                if (!err) {
                    delete $scope.applicant.personalInfo.aadhaar.attachment;
                } else {
                    $scope.docs.aadhaarCard.error = true;
                }
            });
        }

        $scope.aadhaarCard = {
            dzOptions: {
                url: "#",
                method: "get",
                parallelUploads: $scope.docs.aadhaarCard.maxFile,
                acceptedFiles: 'image/jpg,image/jpeg,image/png',
                autoProcessQueue: true,
                maxFilesize: $scope.docs.aadhaarCard.fileSize,
                paramName: function () {
                    return "aadhaarCard";
                },
                maxFiles: $scope.docs.aadhaarCard.maxFile,
                uploadMultiple: (($scope.docs.aadhaarCard.maxFile > 1) ? true : false),
                params: $scope.dropzoneContext,
                headers: $scope.dropzoneContext,
                renameFile: function (file) {
                    file.upload.filename = file.name;
                },
                accept: function (file) {
                    $scope.docs.aadhaarCard.error = false;
                    $scope.docs.aadhaarCard.loader = true;
                    $scope.uploadFileToS3("aadhaarCard", file, function (uploadErr, uploadRes) {
                        if (!uploadErr) {
                            var fileObject = processAadhar(uploadRes);
                            s3.saveSingleCertificate($scope.applicant.contactNo, "aadhaarCard", fileObject, "", function (err, response) {
                                if (err) {
                                    $scope.docs.aadhaarCard.error = true;
                                }
                                $scope.docs.aadhaarCard.loader = false;
                            });
                        } else {
                            $scope.docs.aadhaarCard.error = true;
                            $scope.docs.aadhaarCard.loader = false;
                        }
                    });
                },
                init: function () {
                    $scope.aadhaarDzScope = this;
                    this.on("addedfile", function (file) {
                    });
                }
            },
            dzCallbacks: {
                init: function () {
                    this.on("addedfile", function (file) {
                    });
                },
                "accept": function (file) {
                },
                "sending": function (file, xhr, formData) {
                },
                "addedfile": function (file) {
                },
                "thumbnail": function (file, url) {
                    file.previewElement.querySelector("img").src = url;
                },
                "success": function (file, xhr) {
                    $('.dropzone-click-aadhaarCard').parent().parent().parent().find('.upload-image-custom-error').hide();
                },
                "error": function (file, response) {  // and then can you have your error callback
                    $scope.docs.aadhaarCard.error = true;
                    $('.dropzone-click-aadhaarCard').parent().parent().parent().find('.upload-image-custom-error').show();
                },
                "removedfile": function (file) {
                    var fileObj = $scope.applicant.personalInfo.aadhaar.attachment;
                    removeAadhar(fileObj);
                },
                "complete": function (file) {
                }
            },
            dzMethods: {
            }
        };
        // aadhaar dropzone end

        // 10th Mark Sheet dropzone start

        function getCertcount() {
            if ($scope.applicant.personalInfo && $scope.applicant.personalInfo.attachments) {
                return $scope.applicant.personalInfo.attachments.length;
            }
            return 0;
        }

        function removeSslcCert(removedFile) {
            s3.removeMultipleCertificates($scope.applicant.contactNo, "sslcMarkSheet", removedFile.url, "", function (err, response) {
                $("#sslcMarkSheetConfirmModal").modal("hide");
                if (!err) {
                    if ($scope.sslcMarkSheetCount <= 2) {
                        $('.dropzone-click-sslcMarkSheet').parent().parent().parent().find('.upload-image-custom-error').hide();
                    }
                    $scope.sslcMarkSheetCount -= 1;
                    // to remove the record from cloned array for applicant record
                    var certs = $scope.applicant["personalInfo"].attachments;
                    if (!certs) {
                        return;
                    }
                    var indexToRemove = -1;
                    for (var i = 0; i < certs.length; i++) {
                        if (certs[i].url == removedFile.url) {
                            indexToRemove = i;
                            break;
                        }
                    }
                    if (indexToRemove != -1) {
                        certs.splice(indexToRemove, 1);
                    }
                } else {
                    $scope.docs.sslcMarkSheet.error = true;
                }
            });
        }

        function processSslcCert(file) {
            if (!file) {
                return;
            }

            var fileObject = {
                url: file.signedRequest.filePath,
                contentType: file.type,
                originalname: file.name,
            };

            if (!$scope.applicant.personalInfo) {
                $scope.applicant.personalInfo = { "attachments": [] };
            }

            if (!$scope.applicant.personalInfo.attachments) {
                $scope.applicant.personalInfo.attachments = [];
            }

            $scope.applicant.personalInfo.attachments.push(fileObject);
            return fileObject;
        }

        $scope.sslcMarkSheetCount = getCertcount();

        $scope.sslcMarkSheet = {
            dzOptions: {
                url: "#",
                method: "put",
                parallelUploads: $scope.docs.sslcMarkSheet.maxFile,
                acceptedFiles: 'image/jpg,image/jpeg,image/png',
                autoProcessQueue: true,
                maxFilesize: $scope.docs.sslcMarkSheet.fileSize,
                paramName: function () {
                    return "certificates";
                },
                maxFiles: $scope.docs.sslcMarkSheet.maxFile,
                uploadMultiple: (($scope.docs.sslcMarkSheet.maxFile > 1) ? true : false),
                params: $scope.dropzoneContext,
                headers: $scope.dropzoneContext,
                renameFile: function (file) {
                    file.upload.filename = file.name;
                },
                accept: function (file) {
                    if ($scope.sslcMarkSheetCount >= $scope.docs.sslcMarkSheet.maxFile) {
                        $('.dropzone-click-sslcMarkSheet').parent().parent().parent().find('.upload-image-custom-error').show();
                    } else {
                        $scope.sslcMarkSheetCount += 1;
                        $('.dropzone-click-sslcMarkSheet').parent().parent().parent().find('.upload-image-custom-error').hide();
                        if ($scope.docs.sslcMarkSheet.error) {
                            $('.dropzone-click-sslcMarkSheet').parent().parent().parent().find('.upload-image-custom-error').show();
                        }
                        $scope.docs.sslcMarkSheet.loader = true;
                        $scope.uploadFileToS3("sslcMarkSheet", file, function (uploadErr, uploadRes) {
                            if (!uploadErr) {
                                var fileDetails = processSslcCert(uploadRes);
                                s3.saveMultipleCertificates($scope.applicant.contactNo, "sslcMarkSheet", [fileDetails], "", function (err, response) {
                                    if (err) {
                                        $('.dropzone-click-sslcMarkSheet').parent().parent().parent().find('.upload-image-s3-custom-error').show();
                                        $scope.docs.sslcMarkSheet.error = true;
                                    } else {
                                        $('.dropzone-click-sslcMarkSheet').parent().parent().parent().find('.upload-image-s3-custom-error').hide();
                                    }
                                });
                                $scope.docs.sslcMarkSheet.loader = false;
                            } else {
                                $scope.docs.sslcMarkSheet.loader = false;
                                $scope.sslcMarkSheetCount -= 1;
                                $('.dropzone-click-sslcMarkSheet').parent().parent().parent().find('.upload-image-s3-custom-error').show();
                                $scope.docs.sslcMarkSheet.error = true;
                            }
                        });
                    }
                },
                init: function () {
                    $scope.sslcMarkSheetDzScope = this;
                    this.on("addedfile", function (file) {
                    });
                }
            },
            dzCallbacks: {
                init: function () {
                    this.on("addedfile", function (file) {
                    });
                },
                "sending": function (file, xhr, formData) {
                },
                "addedfile": function (file) {
                },
                "thumbnail": function (file, url) {
                    file.previewElement.querySelector("img").src = url;
                },
                "successmultiple": function (files, xhr) {
                    $('.dropzone-click-sslcMarkSheet').parent().parent().parent().find('.upload-image-custom-error').hide();
                },
                "error": function (file, response) {  // and then can you have your error callback
                    $scope.docs.sslcMarkSheet.error = true;
                    $('.dropzone-click-sslcMarkSheet').parent().parent().parent().find('.upload-image-custom-error').show();
                },
                "removedfile": function (file) {
                    removeSslcCert(file);
                },
                "complete": function (file) {
                }
            },
            dzMethods: {
            }
        };

        $scope.removeSslcMarkSheet = function () {
            var file = $scope.certificateToRemove;
            //dropzone files are different than the file object we have stored
            var dzFiles = $scope.sslcMarkSheetDzScope.files;
            if (!dzFiles) {
                $scope.sslcMarkSheetDzScope.removeFile(file);
                return;
            }

            $scope.sslcMarkSheetDzScope.removeFile(file);
        }

        $scope.setEnvForDeleteSslcMarkSheet = function (file) {
            $scope.certificateToRemove = file;
            $("#sslcMarkSheetConfirmModal").modal("show");
        }

    }
})();
;
(function () {
    'use strict';

    angular.module('ies').controller('preferenceInfoCtrl', preferenceInfoCtrl);
    preferenceInfoCtrl.$inject = ['$scope', '$timeout', 'applicantService', 'dragulaService', 'ValidationService'];
    function preferenceInfoCtrl($scope, $timeout, applicantService, dragulaService, ValidationService) {

        $scope.generateRandomNo = function () {
            return new Date().getTime();
        }

        if ($scope.applicant && (!$scope.applicant.preferences || $scope.applicant.preferences.length == 0)) {
            $scope.applicant.preferences = [''];
            $scope.randomNo = [$scope.generateRandomNo()];
        } else {
            $scope.randomNo = [];
            $scope.applicant.preferences.map(function (val) {
                $scope.randomNo.push($scope.generateRandomNo(),)
            })
        }

        applicantService.getPrograms(function (err, res) {
            if (!err) {
                $scope.programs = res;
                $scope.duplicateProgram = [].concat(res);
                $scope.changeProgramSet();
            }
            else {
                var err = {
                    "data": {
                        "missingValues": [],
                        "errors": [
                            {
                                "section": "preferenceInfo",
                                "error": "Can't fetch Programs from server"
                            }
                        ]
                    }
                };
                $scope.serverSideErrorMsg(err);
            }
        })

        dragulaService.options($scope, 'preferenceItems', {
            removeOnSpill: false
        });

        $scope.addCourse = function () {
            $scope.applicant.preferences.push('');
            $scope.randomNo.push($scope.generateRandomNo());
        }

        $scope.removeCourse = function (index) {
            $scope.restoreValidation($scope.randomNo[index]);
            $timeout(function () {
                $scope.randomNo.splice(index, 1)
                $scope.applicant.preferences.splice(index, 1);
                $scope.changeProgramSet();
            })
        }

        $scope.restoreValidation = function (id) {
            for (var element of $scope.enquiryForm.$validationSummary) {
                var newPattern = 'preferenceCourseName' + id;
                if (newPattern == element.field) {
                    try {
                        new ValidationService().removeValidator($scope.enquiryForm, element.field);
                    }
                    catch (e) { }
                }
            }
        }

        function difference(arr1, arr2) {
            let set2 = new Set(arr2);
            let difference = arr1.filter(x => !set2.has(x));
            return difference;
        }

        $scope.changeProgramSet = function () {
            var prgm = difference($scope.duplicateProgram.map(function (program) { return program.sName }), $scope.applicant.preferences.map(function (preference) { return preference.sName }))
            $scope.programs = $scope.duplicateProgram.filter(function (program) {
                return prgm.includes(program.sName)
            })
        }

    }

})();