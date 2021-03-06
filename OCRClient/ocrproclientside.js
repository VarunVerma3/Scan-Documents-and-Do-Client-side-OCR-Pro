var CurrentPathName = unescape(location.pathname),
	CurrentPath = CurrentPathName.substring(0, CurrentPathName.lastIndexOf("/") + 1);

window.onload = function () {
	if (Dynamsoft && (!Dynamsoft.Lib.product.bChromeEdition || !Dynamsoft.Lib.env.bWin)) {
		var ObjString = [];
		ObjString.push('<div class="p15">');
		ObjString.push("Please note that the sample doesn't work on your current browser, please use a modern browser like Chrome, Firefox, etc. on Windows");
		ObjString.push('</div>');
		Dynamsoft.WebTwainEnv.ShowDialog(400, 180, ObjString.join(''));
		if (document.getElementsByClassName("dynamsoft-dialog-close"))
			document.getElementsByClassName("dynamsoft-dialog-close")[0].style.display = "none";
	} else {
		Dynamsoft.WebTwainEnv.AutoLoad = false;
		Dynamsoft.WebTwainEnv.Containers = [{ ContainerId: 'dwtcontrolContainer', Width: '100%', Height: '600px' }];
		Dynamsoft.WebTwainEnv.RegisterEvent('OnWebTwainReady', Dynamsoft_OnReady);
		/**
		 * In order to use the full version, do the following
		 * 1. Change Dynamsoft.WebTwainEnv.Trial to false
		 * 2. Replace A-Valid-Product-Key with a full version key
		 * 3. Change Dynamsoft.WebTwainEnv.ResourcesPath to point to the full version 
		 *    resource files that you obtain after purchasing a key
		 */
		Dynamsoft.WebTwainEnv.Trial = true;
		Dynamsoft.WebTwainEnv.ProductKey = "t0124vQIAAFhThFIfuWvsMIozirCJTtJoF9Nugjk2fcgbWoe/0UZAxpPq0lHSddtG0eXm3jctDjjTA0iSgQ4f37y86xyHur24PA6YkTnsGOn9tVZjPybzZy/uzNEFN/KNDBjzDbl9BL3dE/zOj5EBY74ht0+7s5qyKNIBxcmLIA=="
		//Dynamsoft.WebTwainEnv.ProductKey = "A-Valid-Product-Key";
		//Dynamsoft.WebTwainEnv.ResourcesPath = "https://tst.dynamsoft.com/libs/dwt/15.2";

		Dynamsoft.WebTwainEnv.Load();
	}
};

var DWObject, ObjString, arySelectedAreas = [], bMultipage, bClearResult = true, _ocrResultFileType,
	OCRFindTextFlags = [
		{ desc: "whole word", val: EnumDWT_OCRFindTextFlags.OCRFT_WHOLEWORD },
		{ desc: "match case", val: EnumDWT_OCRFindTextFlags.OCRFT_MATCHCASE },
		{ desc: "fuzzy match", val: EnumDWT_OCRFindTextFlags.OCRFT_FUZZYMATCH }
	],
	OCRFindTextAction = [
		{ desc: "highlight", val: EnumDWT_OCRFindTextAction.OCRFT_HIGHLIGHT },
		{ desc: "strikeout", val: EnumDWT_OCRFindTextAction.OCRFT_STRIKEOUT },
		{ desc: "mark for redact", val: EnumDWT_OCRFindTextAction.OCRFT_MARKFORREDACT }
	], OCRLanguages = [
		{ desc: "English", val: "eng" },
		{ desc: "Arabic", val: "arabic" },
		{ desc: "French", val: "french" },
		{ desc: "German", val: "german" },
		{ desc: "Italian", val: "italian" },
		{ desc: "Spanish", val: "spanish" }
	], OCRRecognitionModule = [
		{ desc: "auto", val: EnumDWT_OCRProRecognitionModule.OCRPM_AUTO },
		{ desc: "most accurate", val: EnumDWT_OCRProRecognitionModule.OCRPM_MOSTACCURATE },
		{ desc: "balanced", val: EnumDWT_OCRProRecognitionModule.OCRPM_BALANCED },
		{ desc: "fastest", val: EnumDWT_OCRProRecognitionModule.OCRPM_FASTEST }
	], OCROutputFormat = [
		{ desc: "STRING", val: EnumDWT_OCRProOutputFormat.OCRPFT_TXTS },
		{ desc: "TXT", val: EnumDWT_OCRProOutputFormat.OCRPFT_TXTS },
		{ desc: "CSV", val: EnumDWT_OCRProOutputFormat.OCRPFT_TXTCSV },
		{ desc: "Text Formatted", val: EnumDWT_OCRProOutputFormat.OCRPFT_TXTF },
		{ desc: "XML", val: EnumDWT_OCRProOutputFormat.OCRPFT_XML },
		{ desc: "PDF", val: EnumDWT_OCRProOutputFormat.OCRPFT_IOTPDF },
		{ desc: "PDF with MRC compression", val: EnumDWT_OCRProOutputFormat.OCRPFT_IOTPDF_MRC }
	], OCRPDFVersion = [
		{ desc: "", val: "" },
		{ desc: "1.0", val: EnumDWT_OCRProPDFVersion.OCRPPDFV_0 },
		{ desc: "1.1", val: EnumDWT_OCRProPDFVersion.OCRPPDFV_1 },
		{ desc: "1.2", val: EnumDWT_OCRProPDFVersion.OCRPPDFV_2 },
		{ desc: "1.3", val: EnumDWT_OCRProPDFVersion.OCRPPDFV_3 },
		{ desc: "1.4", val: EnumDWT_OCRProPDFVersion.OCRPPDFV_4 },
		{ desc: "1.5", val: EnumDWT_OCRProPDFVersion.OCRPPDFV_5 },
		{ desc: "1.6", val: EnumDWT_OCRProPDFVersion.OCRPPDFV_6 },
		{ desc: "1.7", val: EnumDWT_OCRProPDFVersion.OCRPPDFV_7 }
	], OCRPDFAVersion = [
		{ desc: "", val: "" },
		{ desc: "pdf/a-1a", val: EnumDWT_OCRProPDFAVersion.OCRPPDFAV_1A },
		{ desc: "pdf/a-1b", val: EnumDWT_OCRProPDFAVersion.OCRPPDFAV_1B },
		{ desc: "pdf/a-2a", val: EnumDWT_OCRProPDFAVersion.OCRPPDFAV_2A },
		{ desc: "pdf/a-2b", val: EnumDWT_OCRProPDFAVersion.OCRPPDFAV_2B },
		{ desc: "pdf/a-2u", val: EnumDWT_OCRProPDFAVersion.OCRPPDFAV_2U },
		{ desc: "pdf/a-3a", val: EnumDWT_OCRProPDFAVersion.OCRPPDFAV_3A },
		{ desc: "pdf/a-3b", val: EnumDWT_OCRProPDFAVersion.OCRPPDFAV_3B },
		{ desc: "pdf/a-3u", val: EnumDWT_OCRProPDFAVersion.OCRPPDFAV_3U }

	];


function downloadOCRPro_btn() {
	if (DWObject.Addon.OCRPro.IsModuleInstalled()) {
		/* OCR Pro is already installed */
	}
	else {
		var ObjString = [];
		ObjString.push('<div class="p15" id="ocr-pro-install-dlg">');
		ObjString.push('The <strong>OCR Pro Module</strong> is not installed on this PC<br />Please click the button below to get it installed');
		ObjString.push('<p class="tc mt15 mb15"><input type="button" value="Install OCR Pro" onclick="downloadOCRPro();" class="btn lgBtn bgBlue" /><hr></p>');
		ObjString.push('<i><strong>The installation is a one-time process</strong> <br />It might take some time because the module is around <strong>90MB</strong> in size.</i>');
		ObjString.push('</div>');
		Dynamsoft.WebTwainEnv.ShowDialog(400, 310, ObjString.join(''));
		if (document.getElementsByClassName("dynamsoft-dialog-close")[0])
			document.getElementsByClassName("dynamsoft-dialog-close")[0].style.display = "none";
	}
}

function downloadOCRPro() {
	DCP_DWT_OnClickCloseInstall();
	var strOCRPath = "";
	if (dynamsoft.dcp.b64bit)
		strOCRPath = Dynamsoft.WebTwainEnv.ResourcesPath + "/OCRPResources/OCRProx64.zip";
	else
		strOCRPath = Dynamsoft.WebTwainEnv.ResourcesPath + "/OCRPResources/OCRPro.zip";

	DWObject.Addon.OCRPro.Download(
		strOCRPath,
		function () { /*console.log('PDF dll is installed');*/ },
		function (errorCode, errorString) {
			console.log(errorString);
		}
	);
}

function Dynamsoft_OnReady() {
	DWObject = Dynamsoft.WebTwainEnv.GetWebTwain('dwtcontrolContainer'); // Get the Dynamic Web TWAIN object that is embeded in the div with id 'dwtcontrolContainer'
	if (DWObject) {
		var i;
		DWObject.Width = 504;
		DWObject.Height = 599;
		DWObject.RegisterEvent("OnImageAreaSelected", Dynamsoft_OnImageAreaSelected);
		DWObject.RegisterEvent("OnImageAreaDeSelected", Dynamsoft_OnImageAreaDeselected);
		DWObject.RegisterEvent("OnGetFilePath", ds_start_ocr);

		for (i = 0; i < OCRFindTextFlags.length; i++)
			document.getElementById("ddlFindTextFlags").options.add(new Option(OCRFindTextFlags[i].desc, i));
		for (i = 0; i < OCRFindTextAction.length; i++)
			document.getElementById("ddlFindTextAction").options.add(new Option(OCRFindTextAction[i].desc, i));
		for (i = 0; i < OCRLanguages.length; i++)
			document.getElementById("ddlLanguages").options.add(new Option(OCRLanguages[i].desc, i));
		for (i = 0; i < OCROutputFormat.length; i++)
			document.getElementById("ddlOCROutputFormat").options.add(new Option(OCROutputFormat[i].desc, i));
		for (i = 0; i < OCRRecognitionModule.length; i++)
			document.getElementById("ddlOCRRecognitionModule").options.add(new Option(OCRRecognitionModule[i].desc, i));
		for (i = 0; i < OCRPDFVersion.length; i++)
			document.getElementById("ddlPDFVersion").options.add(new Option(OCRPDFVersion[i].desc, i));
		for (i = 0; i < OCRPDFAVersion.length; i++)
			document.getElementById("ddlPDFAVersion").options.add(new Option(OCRPDFAVersion[i].desc, i));

		document.getElementById("ddlPDFVersion").selectedIndex = 6;

		DWObject.RegisterEvent("OnTopImageInTheViewChanged", Dynamsoft_OnTopImageInTheViewChanged);
		if (DWObject.Addon.PDF.IsModuleInstalled()) {
			downloadOCRPro_btn();
		}
	}
}

function Dynamsoft_OnImageAreaSelected(index, left, top, right, bottom, indexOfArea) {
	if (arySelectedAreas.length + 2 > indexOfArea)
		arySelectedAreas[indexOfArea - 1] = [index, left, top, right, bottom, indexOfArea];
	else
		arySelectedAreas.push(index, left, top, right, bottom, indexOfArea);
}

function Dynamsoft_OnImageAreaDeselected(index) {
	arySelectedAreas = [];
}

function Dynamsoft_OnTopImageInTheViewChanged(index) {
	DWObject.CurrentImageIndexInBuffer = index;
}

function AcquireImage() {
	if (DWObject) {
		DWObject.SelectSource(function () {
			var OnAcquireImageSuccess, OnAcquireImageFailure;
			OnAcquireImageSuccess = OnAcquireImageFailure = function () {
				DWObject.CloseSource();
			};
			DWObject.OpenSource();
			DWObject.IfDisableSourceAfterAcquire = true;
			DWObject.AcquireImage(OnAcquireImageSuccess, OnAcquireImageFailure);
		}, function () {
			console.log('SelectSource failed!');
		});
	}
}

function LoadImages() {
	if (DWObject) {
		if (DWObject.Addon && DWObject.Addon.PDF) {
			DWObject.Addon.PDF.SetResolution(300);
			DWObject.Addon.PDF.SetConvertMode(EnumDWT_ConvertMode.CM_RENDERALL);
		}
		DWObject.LoadImageEx('', 5,
			function () {
			},
			function (errorCode, errorString) {
				alert('Load Image:' + errorString);
			}
		);
	}
}

function SetIfUseRedaction() {
	var selectValue = OCROutputFormat[document.getElementById("ddlOCROutputFormat").selectedIndex].val;
	if (selectValue == EnumDWT_OCRProOutputFormat.OCRPFT_IOTPDF ||
		selectValue == EnumDWT_OCRProOutputFormat.OCRPFT_IOTPDF_MRC) {
		document.getElementById("divVersion").style.display = "";
		document.getElementById("divIfUseRedaction").style.display = "";
	}
	else if (selectValue == EnumDWT_OCRProOutputFormat.OCRPFT_TXTF) {
		document.getElementById("divVersion").style.display = "none";
		document.getElementById("divIfUseRedaction").style.display = "";
	}
	else {
		document.getElementById("divVersion").style.display = "none";
		document.getElementById("divIfUseRedaction").style.display = "none";
		document.getElementById("divRedaction").style.display = "none";
		document.getElementById("chkUseRedaction").checked = false;
	}
}

function SetRedaction() {
	if (document.getElementById("chkUseRedaction").checked) {
		document.getElementById("divRedaction").style.display = "";
	}
	else {
		document.getElementById("divRedaction").style.display = "none";
		document.getElementById("chkUseRedaction").checked = false;
	}
}

function GetErrorInfo(errorcode, errorstring, result) { //This is the function called when OCR fails
	if (errorcode != -2600 && errorcode != -2601) //-2600:LicenseChecker cannot be empty.  -2601:Cannot connect to the LicenseChecker, please check and make sure it's set correctly.
		alert(errorstring);
	var strErrorDetail = "";
	var aryErrorDetailList = result.GetErrorDetailList();
	for (var i = 0; i < aryErrorDetailList.length; i++) {
		if (i > 0)
			strErrorDetail += ";";
		strErrorDetail += aryErrorDetailList[i].GetMessage();
	}
	if (strErrorDetail.length > 0 && errorstring != strErrorDetail)
		alert(strErrorDetail);
}

function GetRectOCRProInfo(sImageIndex, aryZone, result) {
	return GetOCRProInfoInner(result);
}

function OnOCRSelectedImagesSuccess(result) {
	return GetOCRProInfoInner(result);
}

function GetOCRProInfo(sImageIndex, result) {
	return GetOCRProInfoInner(result);
}

function GetOCRProInfoInner(result) {
	if (result == null)
		return null;
	var bRet = "", pageCount = result.GetPageCount();
	if (pageCount == 0) {
		alert("OCR result is Null.");
		return;
	} else {

		for (var i = 0; i < pageCount; i++) {
			var page = result.GetPageContent(i);
			var letterCount = page.GetLettersCount();
			for (var n = 0; n < letterCount; n++) {
				var letter = page.GetLetterContent(n);
				bRet += letter.GetText();
			}
		}
		document.getElementById('divNoteMessage').innerHTML = bRet;
	}
	if (savePath == null) {
		location.href = '#DWTcontainerBtm';
	}
	else if (savePath.length > 1)
		result.Save(savePath);
}

var savePath;
function ds_start_ocr(bSave, count, index, path, name) {
	if (name.substr(-4) != _ocrResultFileType) {
		name += _ocrResultFileType;
	}
	if (path.length > 0 || name.length > 0)
		savePath = path + "\\" + name;
	if (bSave == true && index != -1032) //if cancel, do not ocr
		DoOCRInner();
}

function DoOCR() {
	if (DWObject) {
		if (DWObject.HowManyImagesInBuffer == 0) {
			alert("Please scan or load an image first.");
			return;
		}
		var saveTye = "";
		_ocrResultFileType = "";
		if (document.getElementById("ddlOCROutputFormat").selectedIndex != 0) {
			switch (OCROutputFormat[document.getElementById("ddlOCROutputFormat").selectedIndex].val) {
				case EnumDWT_OCRProOutputFormat.OCRPFT_TXTS:
					_ocrResultFileType = ".txt";
					saveTye = "Plain Text(*.txt)";
					break;
				case EnumDWT_OCRProOutputFormat.OCRPFT_TXTCSV:
					_ocrResultFileType = ".csv";
					saveTye = "CSV(*.csv)";
					break;
				case EnumDWT_OCRProOutputFormat.OCRPFT_TXTF:
					_ocrResultFileType = ".rtf";
					saveTye = "Rich Text Format(*.rtf)";
					break;
				case EnumDWT_OCRProOutputFormat.OCRPFT_XML:
					_ocrResultFileType = ".xml";
					saveTye = "XML Document(*.xml)";
					break;
				case EnumDWT_OCRProOutputFormat.OCRPFT_IOTPDF:
				case EnumDWT_OCRProOutputFormat.OCRPFT_IOTPDF_MRC:
					_ocrResultFileType = ".pdf";
					saveTye = "PDF(*.pdf)";
					break;
			}
			var fileName = "result" + _ocrResultFileType;
			DWObject.ShowFileDialog(true, saveTye, 0, "", fileName, true, false, 0);
		} else {
			savePath = null;
			DoOCRInner();
		}
	}
}

function DoOCRInner() {
	if (DWObject) {
		if (DWObject.HowManyImagesInBuffer == 0) {
			alert("Please scan or load an image first.");
			return;
		}
		var settings = Dynamsoft.WebTwain.Addon.OCRPro.NewSettings();
		var bMultipage = false;
		settings.RecognitionModule = OCRRecognitionModule[document.getElementById("ddlOCRRecognitionModule").selectedIndex].val;
		settings.Languages = OCRLanguages[document.getElementById("ddlLanguages").selectedIndex].val;
		settings.OutputFormat = OCROutputFormat[document.getElementById("ddlOCROutputFormat").selectedIndex].val;
		var selectValue = OCROutputFormat[document.getElementById("ddlOCROutputFormat").selectedIndex].val;
		if (selectValue == EnumDWT_OCRProOutputFormat.OCRPFT_IOTPDF ||
			selectValue == EnumDWT_OCRProOutputFormat.OCRPFT_IOTPDF_MRC) {
			bMultipage = true;
			settings.PDFVersion = OCRPDFVersion[document.getElementById("ddlPDFVersion").selectedIndex].val;
			settings.PDFAVersion = OCRPDFAVersion[document.getElementById("ddlPDFAVersion").selectedIndex].val;
		}
		if (document.getElementById("chkUseRedaction").checked) {
			settings.Redaction.FindText = document.getElementById("txtFindText").value;
			settings.Redaction.FindTextFlags = OCRFindTextFlags[document.getElementById("ddlFindTextFlags").selectedIndex].val;
			settings.Redaction.FindTextAction = OCRFindTextAction[document.getElementById("ddlFindTextAction").selectedIndex].val;
		}
		settings.LicenseChecker = "LicenseChecker.aspx";
		DWObject.Addon.OCRPro.Settings = settings;

		//Get ocr result.
		var i;
		bClearResult = true;
		if (arySelectedAreas.length > 0) {
			document.getElementById('divNoteMessage').innerHTML = '';
			bClearResult = false;
			var zoneArray = [];
			for (i = 0; i < arySelectedAreas.length; i++) {
				var zone = Dynamsoft.WebTwain.Addon.OCRPro.NewOCRZone(arySelectedAreas[i][1], arySelectedAreas[i][2], arySelectedAreas[i][3], arySelectedAreas[i][4]);
				zoneArray.push(zone);
			}
			DWObject.Addon.OCRPro.RecognizeRect(DWObject.CurrentImageIndexInBuffer, zoneArray, GetRectOCRProInfo, GetErrorInfo);
		}
		else if (bMultipage) {
			var nCount = DWObject.HowManyImagesInBuffer;
			DWObject.SelectedImagesCount = nCount;
			for (i = 0; i < nCount; i++) {
				DWObject.SetSelectedImageIndex(i, i);
			}
			DWObject.Addon.OCRPro.RecognizeSelectedImages(OnOCRSelectedImagesSuccess, GetErrorInfo);
		}
		else {
			DWObject.Addon.OCRPro.Recognize(DWObject.CurrentImageIndexInBuffer, GetOCRProInfo, GetErrorInfo);
		}
	}
}

function RemoveSelected() {
	if (DWObject) {
		DWObject.RemoveAllSelectedImages();
	}
}